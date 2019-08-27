import { fs } from '../common';
import { resolve, dirname, join } from 'path';
import { is } from '../is';
import { match } from '../match';

export type Visitor = (e: VisitorArgs) => any | Promise<any>;
export type VisitorArgs = {
  levels: number;
  dir: string;
  isStopped: boolean;
  isRoot: boolean;
  stop(): void;
};

type FirstAncestorOptions = { type?: 'FILE' | 'DIR'; max?: number };

/**
 * Walks up the ancestor tree
 */
export function ancestor(dir: string) {
  dir = resolve(dir);

  const walk = async (fn: Visitor, path: string, state?: VisitorArgs) => {
    let args: VisitorArgs = state
      ? state
      : {
          levels: 0,
          dir: path,
          stop() {
            this.isStopped = true;
          },
          isStopped: false,
          isRoot: false,
        };
    args.dir = path;
    args.isRoot = isRoot(path);
    if (args.isStopped || args.isRoot) {
      return args;
    }

    // Ensure the path exists.
    if (!(await fs.pathExists(path))) {
      throw new Error(`Path does not exist: "${path}".`);
    }

    // Set the path of the directory being examined.
    if (args.levels === 0 && (await is.file(path))) {
      path = dirname(path);
      args.dir = path;
    }

    // Visit the current level.
    await fn(args);

    // Step up a level.
    if (!args.isStopped) {
      args.levels++;
      const parent = dirname(path);
      args = await walk(fn, parent, args); // <== RECURSION.
    }

    // Finish up.
    return args;
  };

  const walkSync = (fn: Visitor, path: string, state?: VisitorArgs) => {
    let args: VisitorArgs = state
      ? state
      : {
          levels: 0,
          dir: path,
          stop() {
            this.isStopped = true;
          },
          isStopped: false,
          isRoot: false,
        };
    args.dir = path;
    args.isRoot = isRoot(path);
    if (args.isStopped || args.isRoot) {
      return args;
    }

    // Ensure the path exists.
    if (!fs.pathExistsSync(path)) {
      throw new Error(`Path does not exist: "${path}".`);
    }

    // Set the path of the directory being examined.
    if (args.levels === 0 && is.fileSync(path)) {
      path = dirname(path);
      args.dir = path;
    }

    // Visit the current level.
    const res = fn(args);
    if (res && typeof res.then === 'function') {
      throw new Error(`Sync version of walk should not return a promise.`);
    }

    // Step up a level.
    if (!args.isStopped) {
      args.levels++;
      const parent = dirname(path);
      args = walkSync(fn, parent, args); // <== RECURSION.
    }

    // Finish up.
    return args;
  };

  const first = async (name: string, options: FirstAncestorOptions = {}) => {
    let res = '';
    const { max } = options;
    const matcher = match(name);
    const isMatch = (input: string) => matcher.base(input);
    await api.walk(async e => {
      if (typeof max === 'number' && e.levels > max) {
        res = '';
        return e.stop();
      }
      const name = (await fs.readdir(e.dir)).find(name => isMatch(name));
      if (name) {
        const path = join(e.dir, name);
        if (await is.type(path, options.type)) {
          res = path;
          return e.stop();
        }
      }
    });
    return res;
  };

  const firstSync = (name: string, options: FirstAncestorOptions = {}) => {
    let res = '';
    const { max } = options;
    const matcher = match(name);
    const isMatch = (input: string) => matcher.base(input);
    api.walkSync(e => {
      if (typeof max === 'number' && e.levels > max) {
        res = '';
        return e.stop();
      }
      const name = fs.readdirSync(e.dir).find(name => isMatch(name));
      if (name) {
        const path = join(e.dir, name);
        if (is.typeSync(path, options.type)) {
          res = path;
          e.stop();
        }
      }
    });
    return res;
  };

  /**
   * Ancestor API.
   */
  const api = {
    dir,

    /**
     * Walks up the tree.
     */
    walk: (fn: Visitor) => walk(fn, dir),
    walkSync: (fn: Visitor) => walkSync(fn, dir),

    /**
     * Walks up the folder tree looking for the given file or folder
     * within each folder in the hierarchy.
     */
    first,
    firstSync,
  };

  // Finish up.
  return api;
}

/**
 * [Helpers]
 */
const isRoot = (path: string) => path === '/' || !path;
