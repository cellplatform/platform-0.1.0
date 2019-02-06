import { resolve, join, dirname } from 'path';
import * as fs from 'fs';
import { ITypescriptConfig } from '../types';

/**
 * Finds the cloest directory that contains the given child folder/file.
 */
export function closestParentOf(
  child: string,
  cwd: string = '.',
): string | undefined {
  cwd = resolve(cwd);

  if (fs.readdirSync(cwd).includes(child)) {
    return cwd;
  }

  cwd = dirname(cwd);
  if (!cwd || cwd === '/') {
    return undefined;
  }

  return closestParentOf(child, cwd); // <== RECURSION
}

/**
 * Reads out a TS config file for the given dir.
 */
export function tsconfig(cwd: string = '.') {
  const file = 'tsconfig.json';
  try {
    const dir = closestParentOf(file, cwd);
    if (!dir) {
      return { success: false };
    }

    const path = join(dir, file);
    const text = fs.readFileSync(path, 'utf8');
    const data: ITypescriptConfig = JSON.parse(text);
    const outDir =
      (data && data.compilerOptions && data.compilerOptions.outDir) ||
      undefined;

    return { success: true, dir, path, data, outDir };
  } catch (error) {
    throw new Error(`Failed to load '${file}' file. ${error.message}`);
  }
}
