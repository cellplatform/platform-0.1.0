import { fs } from '../common';

/**
 * Determines if the given path is a directory
 */
export async function dir(path: string) {
  return (await fs.pathExists(path))
    ? (await fs.lstat(path)).isDirectory()
    : false;
}

/**
 * Determines if the given path is a file
 */
export async function file(path: string) {
  return (await fs.pathExists(path)) ? (await fs.lstat(path)).isFile() : false;
}
