import { exec, spawn } from 'child_process';
import { promisify } from 'util';

// Promisify exec for async/await usage
export const execAsync = promisify(exec);

// Types for command execution results
export interface CommandResult {
  stdout: string;
  stderr: string;
}

export interface ToolResponse {
  meta: {
    progressToken: null;
  };
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

// Helper function to create a standard tool response
export function createToolResponse(stdout: string, stderr?: string): ToolResponse {
  return {
    meta: {
      progressToken: null,
    },
    content: [
      { type: "text", text: stdout },
      ...(stderr ? [{ type: "text", text: `Error: ${stderr}` }] : []),
    ],
  };
}

// Helper function to create an error response
export function createErrorResponse(error: unknown): ToolResponse {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return {
    meta: {
      progressToken: null,
    },
    content: [{ type: "text", text: `Error: ${errorMessage}` }],
    isError: true,
  };
}

// Helper function to handle git apply with patch data
export async function gitApplyWithPatch(patch: string): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const git = spawn('git', ['apply']);
    let stdout = '';
    let stderr = '';

    git.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    git.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    git.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`git apply failed with code ${code}\n${stderr}`));
      }
    });

    git.stdin.write(patch);
    git.stdin.end();
  });
}

// Helper function to execute a command and return a tool response
export async function executeCommand(command: string): Promise<ToolResponse> {
  try {
    const { stdout, stderr } = await execAsync(command);
    return createToolResponse(stdout, stderr);
  } catch (error) {
    return createErrorResponse(error);
  }
}
