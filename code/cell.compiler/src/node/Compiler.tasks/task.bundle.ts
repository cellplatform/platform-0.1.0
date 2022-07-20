import { Stats } from 'webpack';

import { fs, log, Logger, Model, ModelPaths, ProgressSpinner, t } from '../common';
import { ModuleManifest } from '../manifest';
import { bundleDeclarations } from './task.bundle.declarations';
import { afterCompile, wp } from './util';
import { copyStatic } from './task.bundle.copyStatic';
import { mergeLicences } from './task.bundle.licences';

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
            Logger.newline();
            await Logger.stats(stats);
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
  const dir = paths.out.dist;

  await copyStatic({ model, dir });
  await mergeLicences({ dir });
  await ModuleManifest.createAndSave({ model, dir });

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
