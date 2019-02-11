import {
  result,
  changeExtensions,
  exec,
  fs,
  paths,
  IResult,
  ITask,
  getLog,
} from '../common';

export type BuildFormat = 'COMMON_JS' | 'ES_MODULE';

export type IBuildArgs = {
  silent?: boolean;
  remove?: boolean;
  watch?: boolean;
  dir?: string;
  outDir?: string;
};

/**
 * Builds to a set of differing target-formats.
 */
export async function buildAs(
  formats: BuildFormat[],
  args: IBuildArgs = {},
): Promise<IResult> {
  const { silent, outDir = '', reset, code, error } = await processArgs(args);
  const log = getLog(silent);

  if (code !== 0) {
    return result.format({ code, error });
  }
  if (reset) {
    await fs.remove(outDir);
  }
  const tasks: ITask[] = formats.map(format => {
    const title = format === 'ES_MODULE' ? '.mjs ESModule' : '.js  CommonJS';
    return {
      title: `build ${title}`,
      task: async () => {
        return build({ ...args, as: format, remove: false, silent: true });
      },
    };
  });

  // Run tasks.
  log.info();
  const res = await exec.runTasks(tasks, { silent, concurrent: true });

  // Finish up.
  log.info();
  return res;
}

type IArgs = IBuildArgs & { as?: BuildFormat };

/**
 * Runs a TSC build.
 */
export async function build(args: IArgs): Promise<IResult> {
  const { silent } = args;
  const task: ITask = { title: 'build', task: () => buildTask(args) };
  return exec.runTasks(task, { silent });
}

/**
 * Runs a TSC build.
 */
export async function buildTask(args: IArgs): Promise<IResult> {
  const {
    dir = '',
    outDir = '',
    reset,
    silent,
    watch,
    as,
    code,
    error,
  } = await processArgs(args);

  if (code !== 0) {
    return result.format({ code, error });
  }

  // Prepare the command.
  const tsc = 'node_modules/typescript/bin/tsc';
  let cmd = `cd ${fs.resolve(dir)}\n`;

  if (reset) {
    cmd += `rm -rf ${fs.join(outDir)}`;
    cmd += '\n';
  }

  cmd += `node ${fs.join(tsc)}`;
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
    const res = await exec.run(cmd, { silent, dir });
    if (res.code !== 0) {
      return result.fail(`Build failed.`, res.code);
    }
  } catch (error) {
    return result.fail(error);
  }

  // Change ESM (ES Module) file extensions.
  if (as === 'ES_MODULE') {
    changeExtensions({ dir: outDir, from: 'js', to: 'mjs' });
  }

  // Finish up.
  return result.success();
}

/**
 * INTERNAL
 */

export async function processArgs(args: IArgs) {
  const { silent, watch, as = 'COMMON_JS' } = args;
  const reset = args.remove === undefined ? true : args.remove;

  // Retrieve paths.
  const dir = args.dir || paths.closestParentOf('node_modules');
  if (!dir) {
    const error = new Error(
      `The root directory containing 'node_modules' was not found.`,
    );
    return { code: 1, error };
  }

  // Retrieve the TSConfig.
  const tsconfig = paths.tsconfig(dir);
  if (!tsconfig.success) {
    const error = new Error(`A 'tsconfig.json' file could not be found.`);
    return { code: 1, error };
  }

  // Directory code is transpiled to.
  const outDir = args.outDir || tsconfig.outDir;
  if (!outDir) {
    const error = new Error(
      `An 'outDir' is not specified within 'tsconfig.json'.`,
    );
    return { code: 1, error };
  }

  // Finish up.
  return { code: 0, dir, outDir, reset, silent, watch, as };
}
