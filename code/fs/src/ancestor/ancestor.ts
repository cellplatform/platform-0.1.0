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

/**
 * Walks up the ancestor tree
 */
export function ancestor(dir: string) {
  dir = resolve(dir);

  const walkUp = async (fn: Visitor, path: string, state?: VisitorArgs) => {
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
    if (!(await fs.existsSync(path))) {
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
      args = await walkUp(fn, parent, args); // <== RECURSION.
    }

    // Finish up.
    return args;
  };

  /**
   * Ancestor API.
   */
  const api = {
    dir,

    /**
     * Walks up the tree.
     */
    walkUp: (fn: Visitor) => walkUp(fn, dir),

    /**
     * Walks up the folder tree looking for the given file or folder
     * within each folder in the hierarchy.
     */
    first: async (name: string, options: { type?: 'FILE' | 'DIR' } = {}) => {
      let res = '';
      const matcher = match(name);
      const isMatch = (input: string) => matcher.base(input);

      const isType = async (path: string) => {
        switch (options.type) {
          case 'FILE':
            return is.file(path);
          case 'DIR':
            return is.dir(path);
          default:
            return true; // Accept any.
        }
      };

      await api.walkUp(async e => {
        const name = (await fs.readdir(e.dir)).find(name => isMatch(name));
        if (name) {
          const path = join(e.dir, name);
          if (await isType(path)) {
            res = path;
            e.stop();
          }
        }
      });
      return res;
    },
  };

  // Finish up.
  return api;
}

/**
 * [Helpers]
 */
const isRoot = (path: string) => path === '/' || !path;
