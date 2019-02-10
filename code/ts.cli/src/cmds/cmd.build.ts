import { changeExtensions, exec, fs, paths } from '../common';

export type BuildFormat = 'COMMON_JS' | 'ES_MODULE';

export type IBuildArgs = {
  silent?: boolean;
  remove?: boolean;
  watch?: boolean;
  outDir?: string;
};

export type IBuildResult = {
  success: boolean;
  error?: Error;
};

/**
 * Builds to a set of differing target-formats.
 */
export async function buildAs(formats: BuildFormat[], args: IBuildArgs = {}) {
  let index = 0;
  for (const as of formats) {
    const remove = index === 0;
    const res = await build({ ...args, as, remove });
    if (!res.success) {
      return res;
    }
    index++;
  }
  return { success: true };
}

/**
 * Runs a TSC build.
 */
export async function build(
  args: IBuildArgs & { as?: BuildFormat } = {},
): Promise<IBuildResult> {
  const { silent, watch, as = 'COMMON_JS' } = args;
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

  const outDir = args.outDir || tsconfig.outDir;
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
    cmd += `rm -rf ${fs.join(dir, outDir)}`;
    cmd += '\n';
  }
  cmd += `node ${fs.join(dir, tsc)}`;
  cmd += ` --outDir ${outDir}`;
  cmd = watch ? `${cmd} --watch` : cmd;
  switch (as) {
    case 'COMMON_JS':
      cmd += ` --module commonjs`;
      cmd += ` --target es5`;
      cmd += ` --declaration`;
      break;
    case 'ES_MODULE':
      cmd += ` --module es2015`;
      cmd += ` --target ES2017`;
      break;
  }
  cmd += '\n';

  // Execute command.
  try {
    let error: Error | undefined;
    const res = await exec.run(cmd, { silent, dir });
    if (res.code !== 0) {
      error = new Error(`Build failed.`);
      return { success: false, error };
    }
  } catch (error) {
    return { success: false, error };
  }

  // Change ESM (ES Module) file extensions.
  if (as === 'ES_MODULE') {
    changeExtensions({ dir: outDir, from: 'js', to: 'mjs' });
  }

  // Make a copy of the package.json file to the distribution older for publishing.
  // const pkgResult = await copyPackageJson({ rootDir: dir, outDir });
  // if (!pkgResult.success) {
  //   return pkgResult;
  // }

  // Finish up.
  return { success: true };
}
