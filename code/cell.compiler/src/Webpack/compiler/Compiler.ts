import { Stats as IStats, webpack } from 'webpack';
import * as dev from 'webpack-dev-server';

import { log, t } from '../common';
import { wp } from '../config.wp';
import { upload } from './Compiler.upload';
import { logger } from './logger';

type M = t.WebpackModel | t.ConfigBuilderChain;

/**
 * Webpack bundler.
 */
export const Compiler: t.WebpackCompiler = {
  upload,

  /**
   * Build bundle.
   */
  bundle(input, options = {}) {
    return new Promise<t.WebpackBundleResponse>((resolve, reject) => {
      const { compiler, model, config } = toCompiler(input);

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
  },

  /**
   * Bundle and watch for file changes.
   */
  async watch(input) {
    const { compiler, model } = toCompiler(input);
    let count = 0;
    compiler.watch({}, (err, stats) => {
      count++;
      logger.clear().newline();
      log.info.gray(`Watching (${count})`);
      logger.model(model, 2).newline().hr().stats(stats);
    });
  },

  /**
   * Run dev server.
   */
  async dev(input) {
    const model = wp.toModel(input);
    model.mode = 'development'; // NB: Always run dev-server in "development" mode.
    model.target = undefined; //   BUG: HMR fails with an explicitly specified target. https://github.com/webpack/webpack-dev-server/issues/2758

    const { compiler } = toCompiler(model);
    const port = model.port;
    let count = 0;

    compiler.hooks.afterCompile.tap('DevServer', (compilation) => {
      count++;
      logger.clear().newline();
      log.info.gray(`DevServer (${count})`);
      logger.model(model, 2).newline().hr().stats(compilation);
    });

    const host = 'localhost';
    const options = { host, hot: true, stats: false };
    new dev(compiler, options).listen(port, host, () => logger.clear());
  },
};

/**
 * [Helpers]
 */

const toCompiler = (input: M) => {
  const model = wp.toModel(input);
  const config = wp.toWebpackConfig(model);
  const compiler = webpack(config as any);
  return { model, config, compiler };
};

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
