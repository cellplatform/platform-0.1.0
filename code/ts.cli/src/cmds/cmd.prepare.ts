import { fail, fs, IResult, getLog, paths, runCommands } from '../common';

/**
 * Prepares the module for publishing to NPM.
 */
export async function prepare(
  args: { dir?: string; silent?: boolean } = {},
): Promise<IResult> {
  const { silent } = args;
  const log = getLog(args.silent);

  const dir = args.dir || paths.closestParentOf('package.json');
  if (!dir) {
    return fail(`A module root with [package.json] could not be found.`);
  }

  try {
    // TODO 🐷   use NPM when Yarn not installed

    const cmds = ['yarn build', 'yarn lint', 'yarn test'];
    log.info();
    const res = await runCommands(cmds, {
      dir: fs.resolve(dir),
      silent,
      concurrent: true,
      exitOnError: false,
    });
    log.info();
    return res;
  } catch (error) {
    return fail(error);
  }
}
