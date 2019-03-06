import { exec, fs, getLog, IPackageJson, IResult, ITask, paths, result } from '../common';

export type BuildFormat = 'COMMON_JS' | 'ES_MODULE';

export type IBuildArgs = {
  silent?: boolean;
  watch?: boolean;
  dir?: string;
  outDir?: string;
  tsconfig?: string;
};

/**
 * Builds to a set of differing target-formats.
 */
export async function buildAs(formats: BuildFormat[], args: IBuildArgs = {}): Promise<IResult> {
  const { silent, outDir = '', code, error, dir = '' } = await processArgs(args);
  const log = getLog(silent);
  let errorLog: string | undefined;

  if (code !== 0) {
    return result.formatResult({ code, error });
  }

  await fs.remove(outDir);
  await ensureMainHasNoExtension(dir, { silent });

  const tasks: ITask[] = formats.map(format => {
    const title = format === 'ES_MODULE' ? '.mjs ESModule' : '.js  CommonJS';
    return {
      title: `build ${title}`,
      task: async () => {
        const res = await build({ ...args, as: format, silent: true });
        if (res.errorLog && !errorLog) {
          errorLog = res.errorLog;
        }
        if (!res.ok) {
          throw res.error;
        }
        return res;
      },
    };
  });

  // Run tasks.
  log.info();
  const res = await exec.tasks.run(tasks, { concurrent: false });

  // Log any build errors.
  if (errorLog) {
    log.info(`\n${errorLog}`);
  }
  log.info();

  // Finish up.
  const { ok } = res;
  return result.formatResult({ ok, code: ok ? 0 : 1 });
}

type IArgs = IBuildArgs & { as?: BuildFormat };

/**
 * Runs a typescript build.
 */
export async function build(args: IArgs): Promise<IResult & { errorLog?: string }> {
  const { dir = '', outDir = '', silent, watch, as, code, error, tsconfig } = await processArgs(
    args,
  );
  if (code !== 0) {
    return result.formatResult({ code, error });
  }

  // Prepare the command.
  const tsc = 'node_modules/typescript/bin/tsc';
  let cmd = `cd ${fs.resolve(dir)}\n`;

  cmd += `node ${fs.join(tsc)}`;
  cmd += ` --outDir ${outDir}`;
  cmd = watch ? `${cmd} --watch` : cmd;
  cmd = tsconfig ? `${cmd} --project ${tsconfig}` : cmd;

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
    if (watch) {
      // Watching.
      const res = await exec.cmd.run(cmd, { silent, dir });
      return res;
    } else {
      // Not watching.
      const response = exec.cmd.runList(cmd, { silent, dir });
      const res = await response;
      if (res.code !== 0) {
        const errorLog = res.errors.log({ log: null, header: false });
        return { ...result.fail(`Build failed.`, res.code), errorLog };
      }
      return res;
    }
  } catch (error) {
    return result.fail(error);
  }
}

/**
 * INTERNAL
 */
export async function processArgs(args: IArgs) {
  const { silent, watch, as = 'COMMON_JS' } = args;

  // Retrieve paths.
  const dir = args.dir || (await paths.closestParentOf('node_modules'));
  if (!dir) {
    const error = new Error(`The root directory containing 'node_modules' was not found.`);
    return { code: 1, error };
  }

  // Retrieve the TSConfig.
  const tsconfig = await paths.tsconfig(dir, args.tsconfig);
  if (!tsconfig.success) {
    const error = new Error(`A 'tsconfig.json' file could not be found.`);
    return { code: 1, error };
  }

  // Directory code is transpiled to.
  const outDir = args.outDir || tsconfig.outDir;
  if (!outDir) {
    const error = new Error(`An 'outDir' is not specified within 'tsconfig.json'.`);
    return { code: 1, error };
  }

  // Finish up.
  return { code: 0, dir, outDir, silent, watch, as, tsconfig: tsconfig.filename };
}

/**
 * Remove the `.js` file extension from the main entry point
 * on a `package.json` file.
 *
 * NOTE:
 *    This is to prevent inference errors because the module ships
 *    with both `.js` and `.mjs` files.
 */

async function ensureMainHasNoExtension(dir: string, options: { silent?: boolean } = {}) {
  const path = fs.join(dir, 'package.json');
  const pkg = await fs.file.loadAndParse<IPackageJson>(path);
  if (!pkg.main) {
    return false;
  }

  const ext = fs.extname(pkg.main);
  if (['.js', '.mjs'].includes(ext)) {
    const log = getLog(options.silent);
    const from = pkg.main;
    const to = pkg.main.substr(0, pkg.main.length - ext.length);
    log.info();
    log.info(`Removed extension (${ext}) from [package.json].main`);
    log.info(`• from: ${from}`);
    log.info(`• to:   ${to}`);
    log.info();

    pkg.main = to;
    await fs.file.stringifyAndSave<IPackageJson>(path, pkg);
    return true;
  }

  return false;
}
