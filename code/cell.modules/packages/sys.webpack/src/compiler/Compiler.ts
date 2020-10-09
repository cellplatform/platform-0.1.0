import { log } from '@platform/log/lib/server';
import { Compilation as ICompliation, Stats as IStats, webpack } from 'webpack';
import * as dev from 'webpack-dev-server';

import { t } from '../common';
import { wp } from '../webpack';

type M = t.WebpackModel | t.ConfigBuilderChain;

/**
 * Webpack bundler.
 */
export const Compiler: t.WebpackCompiler = {
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
      watching() {
        log.info.gray('Watching');
        log.info(model);
        return write;
      },
      stats(input?: IStats) {
        wp.stats(input).log();
        return write;
      },
    };

    compiler.watch({}, (err, stats) => {
      write.clear().newline().watching().newline().hr().stats(stats);
    });
  },

  /**
   * Run dev server.
   */
  async dev(input) {
    const { compiler, model } = toCompiler(input, { mode: 'development' });
    const port = model.port;

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
      write.clear().header().newline().hr();
    });

    const host = 'localhost';
    const options = {
      hot: true,
      host,
      stats: { chunks: false, modules: false, colors: true },
    };
    new dev(compiler, options).listen(port, host, () => write.clear().header());
  },
};

/**
 * [Helpers]
 */

const toCompiler = (input: M, options: { mode?: t.WebpackMode } = {}) => {
  const { mode } = options;
  const model = mode ? { ...wp.toModel(input), mode } : wp.toModel(input);
  const config = wp.toWebpackConfig(model);
  const compiler = webpack(config);
  return { model, config, compiler };
};

const toBundledResponse = (args: {
  model: t.WebpackModel;
  stats: IStats;
  config: t.WebpackConfig;
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
