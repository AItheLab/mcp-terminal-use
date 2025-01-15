import { z } from 'zod';
import { isWithinAllowedDirectory, resolvePath, ALLOWED_DIRECTORY } from '../utils/constants.js';

export const MkdirSchema = z.object({
  path: z.string().refine(
    (val) => isWithinAllowedDirectory(val),
    'Directory must be created within allowed directory'
  ),
});

export const CdSchema = z.object({
  path: z.string().refine(
    (val) => {
      const targetPath = resolvePath(val);
      return targetPath.startsWith(ALLOWED_DIRECTORY);
    },
    'Can only change to directories within allowed directory'
  ),
});

// Types derived from schemas
export type MkdirArgs = z.infer<typeof MkdirSchema>;
export type CdArgs = z.infer<typeof CdSchema>;

// Validation functions
export function validateMkdirArgs(args: unknown) {
  return MkdirSchema.safeParse(args);
}

export function validateCdArgs(args: unknown) {
  return CdSchema.safeParse(args);
}
