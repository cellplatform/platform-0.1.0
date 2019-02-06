import { exec, paths, join } from '../common';

export type IBuildResult = {
  success: boolean;
  error?: Error;
};

/**
 * Runs a TSC build.
 */
export async function build(
  args: { silent?: boolean; reset?: boolean } = {},
): Promise<IBuildResult> {
  const { silent } = args;
  const reset = args.reset === undefined ? true : args.reset;

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
    const error = new Error(`A 'tsconfig.json' could not be found.`);
    return { success: false, error };
  }

  const outDir = tsconfig.outDir;
  if (!outDir) {
    const error = new Error(
      `An 'outDir' is not specified within 'tsconfig.json'.`,
    );
    return { success: false, error };
  }

  // Execute the build commands.
  try {
    const tsc = 'node_modules/typescript/bin/tsc';
    const cmd = {
      rm: `rm -rf ${join(dir, outDir)}`,
      tsc: `node ${join(dir, tsc)}`,
    };
    if (reset) {
      await exec.run(cmd.rm, { silent, dir });
    }
    await exec.run(cmd.tsc, { silent, dir });
  } catch (error) {
    return { success: false, error };
  }

  // Finish up.
  return { success: true };
}
