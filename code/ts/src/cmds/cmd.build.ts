import { exec, paths, join } from '../common';

export type IBuildResult = {
  success: boolean;
  error?: Error;
};

/**
 * Runs a TSC build.
 */
export async function build(
  args: { silent?: boolean; remove?: boolean; watch?: boolean } = {},
): Promise<IBuildResult> {
  const { silent, watch } = args;
  const reset = args.remove === undefined ? true : args.remove;

  // Retrieve paths.
  const dir = paths.closestParentOf('node_modules');
  if (!dir) {
    const error = new Error(
      `The root directory containing 'node_modules' was not found.`,
    );
    return { success: false, error };
  }

  const tsconfig = paths.tsconfig();
  if (!tsconfig.success) {
    const error = new Error(`A 'tsconfig.json' file could not be found.`);
    return { success: false, error };
  }

  const outDir = tsconfig.outDir;
  if (!outDir) {
    const error = new Error(
      `An 'outDir' is not specified within 'tsconfig.json'.`,
    );
    return { success: false, error };
  }

  // Prepare the command.
  const tsc = 'node_modules/typescript/bin/tsc';
  let cmd = '';
  if (reset) {
    cmd += `rm -rf ${join(dir, outDir)}\n`;
  }
  cmd += `node ${join(dir, tsc)} ${watch ? '--watch' : ''}\n`;

  // Execute command.
  try {
    let error: Error | undefined;
    const res = await exec.run(cmd, { silent, dir });
    if (res.code !== 0) {
      error = new Error(`Tests failed.`);
    }
    return { success: !error, error };
  } catch (error) {
    return { success: false, error };
  }
}
