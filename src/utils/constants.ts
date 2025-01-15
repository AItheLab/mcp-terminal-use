import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Allowed directory for command execution
export const ALLOWED_DIRECTORY = process.env.ALLOWED_DIRECTORY as string

// List of allowed commands
export const ALLOWED_COMMANDS = [
  // Git commands
  'git diff',
  'git diff --staged',
  'git apply',
  'git add -p',
  'git init',
  'git add',
  'git commit',
  'git status',
  'git log',
  // Directory commands
  'mkdir',
  'cd',
  // NPM commands
  'npm init',
  'npm init -y',
  'npm install',
  'npm run',
  'npm add',
  'npm remove',
  'npm create',
  // Yarn commands
  'yarn init',
  'yarn init -y',
  'yarn install',
  'yarn run',
  'yarn add',
  'yarn remove',
  'yarn create',
  // Testing commands
  'jest',
  'vitest',
  'cypress',
  // Linting and formatting
  'eslint',
  'prettier',
  'tsc',
  // File editing commands
  'sed',
] as const;

// Helper function to check if a command is allowed with its options
export function isAllowedCommand(command: string): boolean {
  // Extraer el comando base
  const baseCommand = command.split(' ')[0];
  
  // Caso especial para sed
  if (baseCommand === 'sed') {
    // Verificar que comience con sed -i
    if (!command.startsWith('sed -i')) {
      return false;
    }
    
    // Extraer el path del archivo objetivo (último argumento)
    const matches = command.match(/.*\s+(\/[^\s]+)$/);
    if (!matches || !matches[1]) {
      return false;
    }
    
    const filePath = matches[1].replace(/['"]$/, ''); // Eliminar comillas al final si existen
    
    // Verificar que el archivo objetivo esté dentro del directorio permitido
    if (!isWithinAllowedDirectory(filePath)) {
      return false;
    }
    
    return true;
  }
  
  // Casos especiales para npm create y yarn create
  if (command.startsWith('npm create') || command.startsWith('yarn create')) {
    return true;
  }
  
  // Para otros comandos, mantener la lógica existente
  const commandStart = command.split(' ').slice(0, 2).join(' ');
  return ALLOWED_COMMANDS.some(cmd => {
    if (command.startsWith(cmd)) return true;
    if (commandStart === cmd) return true;
    return false;
  });
}

// Helper function to check if a path is within allowed directory
export function isWithinAllowedDirectory(targetPath: string): boolean {
  const currentDir = process.cwd();
  const absolutePath = path.isAbsolute(targetPath) 
    ? path.resolve(targetPath)
    : path.resolve(currentDir, targetPath);
  return absolutePath.startsWith(ALLOWED_DIRECTORY);
}

// Helper function to resolve path considering current directory
export function resolvePath(targetPath: string): string {
  return path.isAbsolute(targetPath)
    ? path.resolve(targetPath)
    : path.resolve(process.cwd(), targetPath);
}
