import { Stats as IStats } from 'webpack';

import { log, t, Model, fs } from '../common';
import { logger, wp, afterCompile } from './util';

/**
 * Bundle the project.
 */
export const bundle: t.CompilerRunBundle = (input, options = {}) => {
  return new Promise<t.WebpackBundleResponse>((resolve, reject) => {
    const { silent } = options;
    const { compiler, model, config } = wp.toCompiler(input);

    if (!silent) {
      log.info();
      log.info.gray(`Bundling`);
      logger.model(model, { indent: 2, url: true }).newline().hr();
    }

    const copyStatic = async (model: t.CompilerModel, targetDir: string) => {
      const staticDirs = Model(model)
        .static()
        .map(({ dir }) => dir as string)
        .filter(Boolean);

      await Promise.all(
        staticDirs.map(async (from) => {
          const to = fs.join(targetDir, fs.basename(from));
          await fs.copy(from, to);
        }),
      );

      return staticDirs;
    };

    compiler.run(async (err, stats) => {
      if (err) {
        return reject(err);
      }
      if (stats) {
        const res = toBundledResponse({ model, stats, config });
        const compilation = stats.compilation;
        await copyStatic(model, res.dir);
        afterCompile({ model, compilation, webpack: config });

        if (!silent) {
          logger.newline().stats(stats);
        }

        resolve(res);
      }
    });
  });
};

/**
 * [Helpers]
 */

const toBundledResponse = (args: {
  model: t.CompilerModel;
  stats: IStats;
  config: t.WpConfig;
}): t.WebpackBundleResponse => {
  const { model, config } = args;
  const stats = wp.stats(args.stats);
  return {
    ok: stats.ok,
    elapsed: stats.elapsed,
    dir: stats.output.path,
    stats,
    model,
    config,
    toString: () => args.stats.toString({ colors: true }),
  };
};
