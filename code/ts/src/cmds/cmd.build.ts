import {
  exec,
  fs,
  getLog,
  IPackageJson,
  IResult,
  ITask,
  paths,
  result,
  changeExtensions,
} from '../common';

export type BuildFormat = 'COMMON_JS' | 'ES_MODULE';
const BUILD_FORMATS = ['COMMON_JS', 'ES_MODULE'] as BuildFormat[];

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
  const { silent, outDir = '', code, error, cwd = '' } = await processArgs(args);
  const log = getLog(silent);
  let errorLog: string | undefined;

  if (code !== 0) {
    return result.formatResult({ code, error });
  }

  await deleteTempDirs();
  await fs.remove(outDir);
  if (formats.includes('ES_MODULE')) await ensureMainHasNoExtension(cwd, { silent }); // NB: Only relevant if there are dual output formats being built.

  const tasks: ITask[] = formats.map((format) => {
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
  const res = await exec.tasks.run(tasks, { concurrent: true });

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
  const {
    cwd = '',
    outDir = '',
    silent,
    watch,
    as,
    code,
    error,
    tsconfig,
  } = await processArgs(args);
  if (code !== 0) {
    return result.formatResult({ code, error });
  }

  // Prepare the command.
  const tmpDir = toTmpDir(as);
  const tsc = 'tsc';
  let cmd = `cd ${fs.resolve(cwd)}\n`;

  cmd += tsc;
  cmd += ` --outDir ${fs.resolve(watch ? outDir : tmpDir)}`;
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
      cmd += ` --declaration false`; // NB: Declarations added by the COMMON_JS build.
      break;
  }
  cmd += '\n';

  // Execute command.
  try {
    if (watch) {
      /**
       * Watching
       * - simple `common-js` build with watcher.
       */
      await deleteTempDirs();
      const res = await exec.cmd.run(cmd, { silent, cwd });
      return res;
    } else {
      /**
       * Not watching.
       * - full build of both `common-js` and `es-modeule`
       * - build in temporary directories
       * - merge together upon completion
       */
      const response = exec.cmd.runList(cmd, { silent, cwd });
      const res = await response;
      if (res.code !== 0) {
        const errorLog = res.errors.log({ log: null, header: false });
        return { ...result.fail(`Build failed.`, res.code), errorLog };
      }

      // Update file extensions.
      if (as === 'ES_MODULE') {
        await changeExtensions({ dir: tmpDir, from: '.js', to: '.mjs' });
      }

      // Merge into final directory.
      await fs.ensureDir(fs.resolve(outDir));
      await fs.merge(fs.resolve(tmpDir), fs.resolve(outDir));
      await fs.remove(fs.resolve(tmpDir));

      // Finish up.
      return res;
    }
  } catch (error: any) {
    await deleteTempDirs();
    return result.fail(error);
  }
}

/**
 * INTERNAL
 */
async function deleteTempDirs() {
  await Promise.all(
    BUILD_FORMATS.map((format) => toTmpDir(format)).map((dir) => fs.remove(fs.resolve(dir))),
  );
}

function toTmpDir(buildFormat: BuildFormat = 'COMMON_JS') {
  return `.tmp.${buildFormat}`.toLowerCase();
}

export async function processArgs(args: IArgs) {
  const { silent, watch, as = 'COMMON_JS' } = args;

  // Retrieve paths.
  const cwd = args.dir || (await paths.closestParentOf('node_modules'));
  if (!cwd) {
    const error = new Error(`The root directory containing 'node_modules' was not found.`);
    return { code: 1, error };
  }

  // Retrieve the TSConfig.
  const tsconfig = await paths.tsconfig(cwd, args.tsconfig);
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
  return { code: 0, cwd, outDir, silent, watch, as, tsconfig: tsconfig.filename };
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
