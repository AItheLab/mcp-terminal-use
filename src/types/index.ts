import { z } from 'zod';

// Base types for tool responses
export interface ToolMeta {
  progressToken: null;
}

export interface ToolContent {
  type: string;
  text: string;
}

export interface ToolResponse {
  meta: ToolMeta;
  content: ToolContent[];
  isError?: boolean;
}

// Generic handler type
export type ToolHandler = (args: unknown) => Promise<ToolResponse>;

// Schema validation result type
export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: z.ZodError;
};

// Package manager types
export interface PackageManagerOptions {
  packages?: string[];
  flags?: string[];
  dev?: boolean;
}

// Testing types
export interface TestOptions {
  testPath?: string;
  watch?: boolean;
  mode?: 'run' | 'open';
  spec?: string;
}

// Linting types
export interface LintOptions {
  path?: string;
  fix?: boolean;
  write?: boolean;
  project?: string;
}

// Directory types
export interface DirectoryOptions {
  path: string;
}

// Git types
export interface GitOptions {
  path?: string;
  message?: string;
  patch?: string;
  staged?: boolean;
}
