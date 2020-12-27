import { Stats } from 'webpack';

import { fs, log, logger, Model, t, ProgressSpinner } from '../common';
import { BundleManifest } from '../manifest';
import { afterCompile, wp } from './util';
import { Typescript } from '../ts';

/**
 * Bundle the project.
 */
export const bundle: t.CompilerRunBundle = (input, options = {}) => {
  return new Promise<t.WebpackBundleResponse>(async (resolve, reject) => {
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
          const compilation = stats.compilation;

          await compileDeclarations({ model, bundleDir });

          if (compilation) {
            await onCompiled({ model, bundleDir, compilation, webpack });
          }

          if (!silent) {
            logger.newline().stats(stats);
          }

          resolve(res);
        } else {
          reject(new Error(`The compilation did not produce a stats object.`));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

async function compileDeclarations(args: { model: t.CompilerModel; bundleDir: string }) {
  if (!args.model.declarations || args.model.declarations.length === 0) return;
  const declarations = args.model.declarations.map((d) => ({
    include: d.include,
    base: args.bundleDir,
    dir: d.dir,
    silent: true,
  }));

  // Run the [tsc] compiler.
  const ts = Typescript.compiler();
  await Promise.all(declarations.map((params) => ts.declarations(params)));

  // Rename ".d.ts" extension to ".d.txt" so files are served as "plain/text" mimetype.
  await Promise.all([
    declarations
      .map((d) => d.dir)
      .filter((path) => path.endsWith('.d.ts'))
      .forEach((path) => fs.rename(path, path.replace(/\.d\.ts$/, '.d.txt'))),
  ]);
}

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

/**
 * [Helpers]
 */

function toBundledResponse(args: {
  model: t.CompilerModel;
  stats: Stats;
  webpack: t.WpConfig;
}): t.WebpackBundleResponse {
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
