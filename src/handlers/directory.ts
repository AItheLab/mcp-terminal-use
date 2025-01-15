import { ToolResponse } from '../types/index.js';
import { validateMkdirArgs, validateCdArgs } from '../schemas/directory.js';
import { createToolResponse, createErrorResponse, execAsync } from '../utils/command-executor.js';

export async function handleMkdir(args: unknown): Promise<ToolResponse> {
  try {
    const parsed = validateMkdirArgs(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments for mkdir: ${parsed.error}`);
    }

    const { path: dirPath } = parsed.data;
    const { stdout, stderr } = await execAsync(`mkdir -p ${dirPath}`);
    
    return createToolResponse(stdout || "Directory created successfully", stderr);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function handleCd(args: unknown): Promise<ToolResponse> {
  try {
    const parsed = validateCdArgs(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments for cd: ${parsed.error}`);
    }

    const { path: dirPath } = parsed.data;
    try {
      process.chdir(dirPath);
      return createToolResponse(`Changed directory to: ${process.cwd()}`);
    } catch (err) {
      const error = err as Error;
      throw new Error(`Failed to change directory: ${error.message}`);
    }
  } catch (error) {
    return createErrorResponse(error);
  }
}
