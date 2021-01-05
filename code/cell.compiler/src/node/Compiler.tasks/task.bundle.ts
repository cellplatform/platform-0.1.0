import { Stats } from 'webpack';

import { fs, log, logger, Model, t, ProgressSpinner, toModel, time, format } from '../common';
import { BundleManifest } from '../manifest';
import { afterCompile, wp } from './util';
import { Typescript } from '../ts';

/**
 * Bundle the project.
 */
export const bundle: t.CompilerRunBundle = (input, options = {}) => {
  return new Promise<t.CompilerRunBundleResponse>(async (resolve, reject) => {
    try {
      const { silent } = options;
      const { compiler, model, webpack } = wp.toCompiler(input);
      await ensureEntriesExist({ model });

      const bundleDir = Model(model).bundleDir;
      await fs.remove(bundleDir);

      const spinner = ProgressSpinner({ label: 'bundling...', silent });
      if (!silent) {
        log.info();
        log.info.gray(`Bundle`);
        logger.model(model, { indent: 2, url: false }).newline().hr();
        spinner.start();
      }

      compiler.run(async (err, stats) => {
        spinner.stop();
        if (err) {
          return reject(err);
        }
        if (stats) {
          const res = toBundledResponse({ model, stats, webpack });
          await bundleDeclarations(input);

          const compilation = stats.compilation;
          if (compilation) {
            await onCompiled({ model, bundleDir, compilation, webpack });
          }

          if (!silent) {
            logger.newline().stats(stats);
          }

          resolve(res);
        } else {
          spinner.stop();
          reject(new Error(`The compilation did not produce a stats object.`));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

export async function onCompiled(args: {
  model: t.CompilerModel;
  bundleDir: string;
  compilation: t.WpCompilation;
  webpack: t.WpConfig;
}) {
  const { model, bundleDir, compilation, webpack } = args;
  await copyStatic({ model, bundleDir });
  await BundleManifest.createAndSave({ model, sourceDir: bundleDir });
  afterCompile({ model, compilation, webpack });
}

export const bundleDeclarations: t.CompilerRunBundleDeclarations = async (input, options = {}) => {
  const { silent } = options;
  const timer = time.timer();
  const label = `compiling type declarations (${log.green('.d.ts')} files)...`;
  const spinner = ProgressSpinner({ label });
  if (!silent) {
    log.info();
    spinner.start();
  }

  const model = toModel(input);
  const bundleDir = Model(model).bundleDir;

  const declarations = model.declarations;
  if (declarations) {
    const ts = Typescript.compiler();

    const params: t.TscTranspileDeclarationsArgs[] = declarations.map((lib) => {
      const source = lib.include;
      const outdir = fs.join(bundleDir, 'types.d', lib.dir);
      return { source, outdir, silent: true };
    });

    const res = await Promise.all(params.map((params) => ts.declarations.transpile(params)));
    await ts.manifest.generate({ dir: bundleDir });

    if (!silent) {
      spinner.stop();
      log.info.gray(`Declarations (${log.yellow(timer.elapsed.toString())})`);
      res.forEach((res) => {
        const base = fs.resolve('.');
        const dir = format.filepath(res.out.dir.substring(base.length));
        log.info(`  ${dir}`);
      });
      log.info();
    }
  }

  // Finish up.
  spinner.stop();
  return {
    ok: true,
    elapsed: timer.elapsed.msec,
    model,
    dir: bundleDir,
  };
};

/**
 * [Helpers]
 */

function toBundledResponse(args: {
  model: t.CompilerModel;
  stats: Stats;
  webpack: t.WpConfig;
}): t.CompilerRunBundleResponse {
  const { model, webpack } = args;
  const stats = wp.stats(args.stats);
  return {
    ok: stats.ok,
    elapsed: stats.elapsed,
    dir: stats.output.path,
    stats,
    model,
    webpack,
    toString: () => args.stats.toString({ colors: true }),
  };
}

async function copyStatic(args: { model: t.CompilerModel; bundleDir: string }) {
  const model = Model(args.model);
  const staticDirs = model
    .static()
    .map(({ dir }) => dir as string)
    .filter(Boolean);

  await Promise.all(
    staticDirs.map(async (from) => {
      const to = fs.join(args.bundleDir, fs.basename(from));
      await fs.copy(from, to);
    }),
  );

  return staticDirs;
}

async function ensureEntriesExist(args: { model: t.CompilerModel }) {
  const model = Model(args.model);
  const entry = model.entry();

  for (const key of Object.keys(entry)) {
    const path = fs.resolve(entry[key]);
    const dir = fs.dirname(path);
    if (!(await fs.pathExists(dir))) {
      const err = `The entry path for '${key}' does not exist: ${path}`;
      throw new Error(err);
    }
  }
}
