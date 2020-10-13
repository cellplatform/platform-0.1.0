import { Stats as IStats } from 'webpack';

import { log, t, logger } from '../common';
import { wp } from '../config.wp';
import * as util from './util';

/**
 * Bundle the project.
 */
export const bundle: t.WebpackBundle = (input, options = {}) => {
  return new Promise<t.WebpackBundleResponse>((resolve, reject) => {
    const { compiler, model, config } = util.toCompiler(input);

    if (!options.silent) {
      log.info();
      log.info.gray(`Bundling`);
      logger.model(model, 2).newline().hr();
    }

    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }
      if (stats) {
        const res = toBundledResponse({ model, stats, config });

        if (!options.silent) {
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
  model: t.WebpackModel;
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
