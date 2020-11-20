import { Stats } from 'webpack';

import { fs, log, logger, Model, t } from '../common';
import { BundleManifest } from '../Compiler';
import { afterCompile, wp } from './util';

/**
 * Bundle the project.
 */
export const bundle: t.CompilerRunBundle = (input, options = {}) => {
  return new Promise<t.WebpackBundleResponse>(async (resolve, reject) => {
    const { silent } = options;
    const { compiler, model, webpack } = wp.toCompiler(input);

    const bundleDir = Model(model).bundleDir;
    await fs.remove(bundleDir);

    if (!silent) {
      log.info();
      log.info.gray(`Bundling`);
      logger.model(model, { indent: 2, url: false }).newline().hr();
    }

    compiler.run(async (err, stats) => {
      if (err) {
        return reject(err);
      }
      if (stats) {
        const res = toBundledResponse({ model, stats, webpack });
        const compilation = stats.compilation;

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
  await BundleManifest.createAndSave({ model, bundleDir });
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
