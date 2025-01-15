#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Import schemas
import { MkdirSchema, CdSchema } from './src/schemas/directory.js';

// Import handlers
import { handleMkdir, handleCd } from './src/handlers/directory.js';

// Import utils
import { isAllowedCommand, isWithinAllowedDirectory } from './src/utils/constants.js';
import { createErrorResponse, execAsync, createToolResponse } from './src/utils/command-executor.js';

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

// Execute command schema
const ExecuteCommandSchema = z.object({
  command: z.string().refine(
    (val) => {
      // Directory commands
      if (val.startsWith('cd') || val.startsWith('mkdir')) {
        const parts = val.split(' ');
        if (parts.length < 2) return false;
        const dirPath = parts[1];
        return isWithinAllowedDirectory(dirPath);
      }
      
      // Check if command is allowed with its options
      return isAllowedCommand(val);
    },
    'Command not allowed or path is outside allowed directory'
  ),
});

// Server setup
const server = new Server(
  {
    name: "terminal-server",
    version: "0.2.1",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "execute_command",
        description: "Execute a terminal command and get its output. Only allowed commands are permitted and must be within the /Users/{username}/the/path/you/use directory.",
        inputSchema: zodToJsonSchema(ExecuteCommandSchema) as ToolInput,
      },
      {
        name: "mkdir",
        description: "Create a new directory within the allowed directory.",
        inputSchema: zodToJsonSchema(MkdirSchema) as ToolInput,
      },
      {
        name: "cd",
        description: "Change to any directory within the allowed directory or its subdirectories.",
        inputSchema: zodToJsonSchema(CdSchema) as ToolInput,
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    let response;
    switch (name) {
      case "execute_command": {
        const parsed = ExecuteCommandSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for execute_command: ${parsed.error}`);
        }
        
        const { command } = parsed.data;
        const { stdout, stderr } = await execAsync(command);
        response = createToolResponse(stdout, stderr);
        break;
      }

      case "mkdir":
        response = await handleMkdir(args);
        break;

      case "cd":
        response = await handleCd(args);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    // Convert ToolResponse to the expected format
    return {
      _meta: {
        progressToken: null
      },
      content: response.content
    };
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return {
      _meta: {
        progressToken: null
      },
      content: errorResponse.content
    };
  }
});

// Start server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Terminal MCP Server running on localhost");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
