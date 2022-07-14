import { fs } from '@platform/fs';
import { exec } from '@platform/exec';

export const BuildAll = {
  /**
   * Run the "build" command on all projects within the given directory
   */
  async run(args: { parentDir: string }) {
    const dirs = (await fs.readdir(fs.resolve(args.parentDir)))
      .filter((name) => !name.startsWith('.'))
      .map((name) => fs.join(args.parentDir, name));

    /**
     * TODO 🐷
     * Calculate depth-first dependency graph.
     */

    return await exec.cmd.runList(dirs.map((dir) => `cd ${dir} && yarn build`));
  },
};
