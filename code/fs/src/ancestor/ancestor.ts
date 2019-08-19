import { fs } from '../common';
import { resolve, dirname } from 'path';
import { is } from '../is';

export type Visitor = (e: VisitorArgs) => Promise<any>;
export type VisitorArgs = {
  levels: number;
  dir: string;
  isStopped: boolean;
  isRoot: boolean;
  stop(): void;
};

const isRoot = (path: string) => path === '/' || !path;

/**
 * Walks up the ancestor tree
 */
export function ancestor(dir: string) {
  dir = resolve(dir);

  /**
   * Walks up the tree.
   */
  const walkUp = async (fn: Visitor, path: string, state?: VisitorArgs) => {
    let args: VisitorArgs = state
      ? state
      : {
          levels: 0,
          dir: path,
          stop: () => (args.isStopped = true),
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
    fn(args);

    // Step up a level.
    if (!args.isStopped) {
      args.levels++;
      const parent = dirname(path);
      args = await walkUp(fn, parent, args); // <== RECURSION.
    }

    // Finish up.
    return args;
  };

  // Finish up.
  return {
    dir,
    walkUp: (fn: Visitor) => walkUp(fn, dir),
  };
}
