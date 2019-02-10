import { exec, paths, join, fs, log } from '../common';

export type IChmodResult = {
  success: boolean;
  error?: Error;
};

/**
 * Change permissions on [node_modules/.bin] files.
 * NOTE:
 *    Useful when file-syncing during development has reset permissions.
 */
export async function chmod(
  args: { silent?: boolean; permissions?: string } = {},
): Promise<IChmodResult> {
  const dir = paths.closestParentOf('node_modules');
  if (!dir) {
    const error = new Error(`A root package could not be found`);
    return { success: false, error };
  }

  // Prepare paths.
  const { permissions, silent } = args;
  const bin = join(dir, 'node_modules/.bin');
  const files = fs.readdirSync(bin).map(name => join(bin, name));

  const info = (msg: string = '') => {
    if (!silent) {
      log.info(msg);
    }
  };

  // Change permissions.
  for (const path of files) {
    const cmd = `chmod ${permissions} ${path}`;
    try {
      info(` • ${cmd}`);
      const res = await exec.run(cmd, { silent: true });

      if (res.code !== 0) {
        return { success: false };
      }
    } catch (error) {
      return { success: false, error };
    }
  }

  // Finish up.
  info();
  return { success: true };
}
