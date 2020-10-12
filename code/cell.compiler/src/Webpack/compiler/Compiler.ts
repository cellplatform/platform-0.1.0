import { Compilation as ICompliation, Stats as IStats, webpack } from 'webpack';
import * as dev from 'webpack-dev-server';
import { logger } from './logger';

import { t, log } from '../common';
import { wp } from '../config.wp';
import { upload } from './Compiler.upload';

type M = t.WebpackModel | t.ConfigBuilderChain;

/**
 * Webpack bundler.
 */
export const Compiler: t.WebpackCompiler = {
  upload,

  /**
   * Build bundle.
   */
  bundle(input) {
    return new Promise<t.WebpackBundleResponse>((resolve, reject) => {
      const { compiler, model, config } = toCompiler(input);
      compiler.run((err, stats) => {
        if (err) {
          return reject(err);
        }
        if (stats) {
          const res = toBundledResponse({ model, stats, config });
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
    const { compiler, model } = toCompiler(input, { mode: 'development' });
    const port = model.port;
    let count = 0;

    const write = {
      clear() {
        log.clear();
        return write;
      },
      newline() {
        log.info();
        return write;
      },
      hr() {
        log.info.gray('━'.repeat(60));
        return write;
      },
      header() {
        const url = `http://localhost`;
        log.info();
        log.info(`👋 ${log.cyan(url)}:${log.magenta(port)}`);
        log.info.gray(`   ${model.mode}: ${model.name}`);
        return write;
      },
      stats(input?: IStats | ICompliation) {
        wp.stats(input).log();
        return write;
      },
    };

    compiler.hooks.afterCompile.tap('DevServer', (compilation) => {
      count++;
      logger.clear().newline();
      log.info.gray(`DevServer (${count})`);
      logger.model(model, 2).newline().hr().stats(compilation);
    });

    const host = 'localhost';
    const options = {
      hot: true,
      host,
      stats: false,
    };
    new dev(compiler, options).listen(port, host, () => write.clear().header());
  },
};

/**
 * [Helpers]
 */

const toCompiler = (input: M, options: { mode?: t.WpMode } = {}) => {
  const { mode } = options;
  const model = mode ? { ...wp.toModel(input), mode } : wp.toModel(input);
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
