import { webpack, Stats } from 'webpack';
import { log } from '@platform/log/lib/server';

import * as dev from 'webpack-dev-server';

import { t } from '../common';
import { toWebpackConfig, toModel } from './wp';

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
        log.info();
        log.info.gray('━'.repeat(60));
        return write;
      },
      watching() {
        log.info.gray('Watching');
        log.info(model);
        return write;
      },
      stats(stats?: Stats) {
        log.info(stats?.toString({ colors: true }));
        log.info();
        return write;
      },
    };

    compiler.watch({}, (err, stats) => {
      write.clear().newline().watching().hr().stats(stats);
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
      header() {
        const url = `http://localhost`;
        log.info();
        log.info(`👋 ${log.cyan(url)}:${log.magenta(port)}`);
        log.info.gray(`   ${model.mode}: ${model.name}`);
        log.info();
        log.info.gray('━'.repeat(60));
        return write;
      },
    };

    compiler.hooks.afterCompile.tap('DevServer', (compilation) => write.clear().header());

    const host = 'localhost';
    const options = { hot: true, host };
    new dev(compiler, options).listen(port, host, () => write.clear().header());
  },
};

/**
 * [Helpers]
 */

const toCompiler = (input: M, options: { mode?: t.WebpackMode } = {}) => {
  const { mode } = options;
  const model = mode ? { ...toModel(input), mode } : toModel(input);
  const config = toWebpackConfig(model);
  const compiler = webpack(config);
  return { model, config, compiler };
};

const toBundledResponse = (args: {
  model: t.WebpackModel;
  stats: Stats;
  config: t.WebpackConfig;
}): t.WebpackBundleResponse => {
  const { stats, model, config } = args;
  const elapsed = stats.endTime - stats.startTime;
  const ok = !stats.hasErrors();
  return {
    ok,
    elapsed,
    stats,
    model,
    config,
    toString: () => stats.toString({ colors: true }),
  };
};
