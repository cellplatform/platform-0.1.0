import { fs } from '../common';
import { ancestor } from '../ancestor';
import { dirname } from 'path';

/**
 * Determine if the given input is a node stream
 */
export function stream(input?: any) {
  return typeof input?.on === 'function';
}

/**
 * Determines if the given path is a directory.
 */
export async function dir(path: string) {
  return (await fs.pathExists(path)) ? (await fs.lstat(path)).isDirectory() : false;
}
export function dirSync(path: string) {
  return fs.pathExistsSync(path) ? fs.lstatSync(path).isDirectory() : false;
}

/**
 * Determines if the given path is a file.
 */
export async function file(path: string) {
  return (await fs.pathExists(path)) ? (await fs.lstat(path)).isFile() : false;
}
export function fileSync(path: string) {
  return fs.pathExistsSync(path) ? fs.lstatSync(path).isFile() : false;
}

/**
 * Determines if type of path is the given type of file-system object.
 */
export async function type(path: string, type?: 'FILE' | 'DIR') {
  switch (type) {
    case 'FILE':
      return file(path);
    case 'DIR':
      return dir(path);
    default:
      return true; // Accept any.
  }
}
export function typeSync(path: string, type?: 'FILE' | 'DIR') {
  switch (type) {
    case 'FILE':
      return fileSync(path);
    case 'DIR':
      return dirSync(path);
    default:
      return true; // Accept any.
  }
}

/**
 * Determine if the given path is a symbolic link.
 */
export async function symlink(path: string, options: { ancestor?: boolean } = {}) {
  if (typeof path !== 'string') return false;
  if (!(await fs.pathExists(path))) return false;
  if (await Symlink.isLink(path)) return true;
  return options.ancestor ? await Symlink.isWithinLinkedDir(path) : false;
}



/**
 * [Helpers]
 */

const Symlink = {
  async isLink(path: string) {
    return (await fs.lstat(path)).isSymbolicLink();
  },

  async isWithinLinkedDir(path: string) {
    let result = false;
    await ancestor(dirname(path)).walk(async (visitor) => {
      if (await Symlink.isLink(visitor.dir)) {
        result = true;
        visitor.stop();
      }
    });
    return result;
  },
};
