import { Stats as IStats } from 'webpack';

import { log, t } from '../common';
import { logger, wp } from './util';

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

    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }
      if (stats) {
        const res = toBundledResponse({ model, stats, config });

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
    stats,
    model,
    config,
    toString: () => args.stats.toString({ colors: true }),
  };
};
