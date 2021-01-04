import { fs } from '../common';
import { TscCompiler } from './compiler';

/**
 * Main entry-point for programatically working
 * with the typescript compiler.
 */
export const Typescript = {
  compiler: TscCompiler,

  /**
   * Cleans up any transient build artifacts that may not have
   * been automatically removed during normal operation.
   */
  async clean() {
    const pattern = `${fs.resolve('.')}/tsconfig.tmp.*`;
    const paths = await fs.glob.find(pattern);
    await Promise.all(paths.map((path) => fs.remove(path)));
    return paths;
  },
};
