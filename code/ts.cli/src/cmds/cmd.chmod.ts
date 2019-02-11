import { exec, fs, getLog, ICommand, IResult, paths, result } from '../common';

/**
 * Change permissions on [node_modules/.bin] files.
 * NOTE:
 *    Useful when file-syncing during development has reset permissions.
 */
export async function chmod(
  args: { silent?: boolean; permissions?: string } = {},
): Promise<IResult> {
  const dir = paths.closestParentOf('node_modules');
  if (!dir) {
    return result.fail(`A module 'package.json' could not be found`);
  }

  const { permissions, silent } = args;
  const log = getLog(silent);

  // Prepare paths.
  const bin = fs.join(dir, 'node_modules/.bin');
  const files = fs.readdirSync(bin).map(name => fs.join(bin, name));

  // Change permissions.
  const cmds: ICommand[] = files.map(path => {
    return {
      title: `chmod ${permissions} .bin/${fs.basename(path)}`,
      cmd: `chmod ${permissions} ${path}`,
    };
  });

  log.info();
  const res = await exec.runCommands(cmds, { silent, concurrent: true });

  // Finish up.
  log.info();
  return res;
}
