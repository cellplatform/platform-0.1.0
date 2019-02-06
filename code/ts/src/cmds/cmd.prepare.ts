import { log, paths } from '../common';
import { build } from './cmd.build';
import { lint } from './cmd.lint';
import { test } from './cmd.test';

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

  const fail = (code: number, error: Error) => {
    return { success: false, error };
  };

  try {
    let error: Error | undefined;

    info(` • build`);
    error = (await build({ silent: true })).error;
    if (error) {
      return fail(1, error);
    }

    info(` • test`);
    error = (await test({ silent: true })).error;
    if (error) {
      return fail(1, error);
    }

    info(` • lint`);
    error = (await lint({ silent: true })).error;
    if (error) {
      return fail(1, error);
    }

    info();
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
