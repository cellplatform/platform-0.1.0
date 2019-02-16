import { fs } from './libs';
import { ITypescriptConfig } from '../types';

/**
 * Finds the cloest directory that contains the given child folder/file.
 */
export async function closestParentOf(
  child: string,
  cwd: string = '.',
): Promise<string | undefined> {
  cwd = fs.resolve(cwd);

  if ((await fs.readdir(cwd)).includes(child)) {
    return cwd;
  }

  cwd = fs.dirname(cwd);
  if (!cwd || cwd === '/') {
    return undefined;
  }

  return closestParentOf(child, cwd); // <== RECURSION
}

/**
 * Reads out a TS config file for the given dir.
 */
export async function tsconfig(cwd: string = '.') {
  const file = 'tsconfig.json';
  try {
    const dir = await closestParentOf(file, cwd);
    if (!dir) {
      return { success: false };
    }

    const path = fs.join(dir, file);
    const data = await fs.file.loadAndParse<ITypescriptConfig>(path);

    const outDir = (data && data.compilerOptions && data.compilerOptions.outDir) || undefined;

    return { success: true, dir, path, data, outDir };
  } catch (error) {
    throw new Error(`Failed to load '${file}' file. ${error.message}`);
  }
}
