import { fs, exec } from './common';

type DirPath = string;

export const Cmds = {
  /**
   * Run the "build" command on all projects within the given directory
   */
  async buildAll(args: { within: DirPath }) {
    const dirs = (await fs.readdir(fs.resolve(args.within)))
      .filter((name) => !name.startsWith('.'))
      .map((name) => fs.join(args.within, name));

    /**
     * TODO 🐷
     * Calculate depth-first dependency graph.
     */

    return await exec.cmd.runList(dirs.map((dir) => `cd ${dir} && yarn build`));
  },
};
