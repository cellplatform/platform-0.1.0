import { exec, log, paths } from '../common';

export type IPrepareResult = {
  success: boolean;
  error?: Error;
};

/**
 * Prepares the module for publishing to NPM.
 */
export async function prepare(
  args: { silent?: boolean } = {},
): Promise<IPrepareResult> {
  const { silent } = args;

  const info = (msg: string = '') => {
    if (!silent) {
      log.info(msg);
    }
  };

  const dir = paths.closestParentOf('package.json');
  if (!dir) {
    const error = new Error(
      `A module root with [package.json] could not be found.`,
    );
    return { success: false, error };
  }

  info();
  info('prepare:');

  try {
    // TODO 🐷   use NPM when Yarn not installed

    const cmds = ['yarn build', 'yarn lint', 'yarn test'];

    for (const cmd of cmds) {
      info(` • ${cmd}`);
      const res = await exec.run(cmd, { silent: true });
      if (res.code !== 0) {
        const error = new Error(`Failed while running '${cmd}'.`);
        return { success: false, error };
      }
    }

    info();
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
