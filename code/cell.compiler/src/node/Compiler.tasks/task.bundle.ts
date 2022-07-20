import { Stats } from 'webpack';

import { fs, log, Logger, Model, ModelPaths, ProgressSpinner, t } from '../common';
import { ModuleManifest } from '../manifest';
import { bundleDeclarations } from './task.bundle.declarations';
import { afterCompile, wp } from './util';

/**
 * Bundle the project.
 */
export const bundle: t.CompilerRunBundle = (input, options = {}) => {
  return new Promise<t.CompilerRunBundleResponse>(async (resolve, reject) => {
    try {
      const { silent } = options;

      const { compiler, model, webpack } = wp.toCompiler(input);
      await ensureEntriesExist({ model });

      const paths = ModelPaths(model);
      await fs.remove(paths.out.dist);

      const spinner = ProgressSpinner({ label: 'bundling...', silent });
      if (!silent) {
        log.info();
        log.info.gray(`Bundle`);
        Logger.model(model, { indent: 2, url: false }).newline().hr();
        spinner.start();
      }

      compiler.run(async (err, stats) => {
        spinner.stop();
        if (err) {
          return reject(err);
        }
        if (stats) {
          const res = toBundledResponse({ model, stats, webpack });
          await bundleDeclarations(input, { silent });

          const compilation = stats.compilation;
          if (compilation) {
            await onCompiled({ model, compilation, webpack });
          }

          if (!silent) {
            Logger.newline().stats(stats);
          }

          resolve(res);
        } else {
          spinner.stop();
          reject(new Error(`The compilation did not produce a stats object.`));
        }
      });
    } catch (error: any) {
      reject(error);
    }
  });
};

export async function onCompiled(args: {
  model: t.CompilerModel;
  compilation: t.WpCompilation;
  webpack: t.WpConfig;
}) {
  const { model, compilation, webpack } = args;
  const paths = ModelPaths(model);

  await copyStatic({ model, bundleDir: paths.out.dist });
  await ModuleManifest.createAndSave({ model, dir: paths.out.dist });

  afterCompile({ model, compilation, webpack });
}

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
