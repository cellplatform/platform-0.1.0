import { exec, fs, getLog, IResult, paths, result } from '../common';

/**
 * Prepares the module for publishing to NPM.
 */
export async function prepare(args: { dir?: string; silent?: boolean } = {}): Promise<IResult> {
  const { silent } = args;
  const log = getLog(args.silent);
  const dir = args.dir || (await paths.closestParentOf('package.json'));
  if (!dir) {
    return result.fail(`A module root with [package.json] could not be found.`);
  }

  /**
   * Run commands.
   */
  try {
    log.info();
    const cmds = ['yarn build', 'yarn lint', 'yarn test'];
    const res = await exec.cmd.runList(cmds, {
      cwd: fs.resolve(dir),
      silent,
      concurrent: true,
      exitOnError: false,
    });

    res.errors.log({ log });
    return res;
  } catch (error) {
    return result.fail(error);
  }
}
