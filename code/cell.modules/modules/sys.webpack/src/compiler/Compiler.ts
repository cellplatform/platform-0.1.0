import { webpack, Stats } from 'webpack';
import { log } from '@platform/log/lib/server';

import * as dev from 'webpack-dev-server';

import { t } from '../common';
import { toWebpackConfig } from './toWebpackConfig';

type M = t.WebpackModel | t.ConfigBuilderChain;

/**
 * Webpack bundler.
 */
export const Compiler: t.WebpackCompiler = {
  bundle(input) {
    return new Promise<t.WebpackBundleResponse>((resolve, reject) => {
      const { compiler, model } = toCompiler(input);
      compiler.run((err, stats) => {
        if (err) {
          return reject(err);
        }
        if (stats) {
          const res = toBundled(model, stats);
          resolve(res);
        }
      });
    });
  },

  async watch(input) {
    const { compiler, model } = toCompiler(input);
    compiler.watch({}, (err, stats) => {
      log.clear();
      log.info(model);
      log.info('-------------------------------------------');
      log.info(stats?.toString({ colors: true }));
      log.info();
    });
  },

  async dev(input) {
    const { compiler, model } = toCompiler(input, { mode: 'development' });
    const port = model.port;

    const logListening = (clear?: boolean) => {
      if (clear) {
        log.clear();
      }
      const url = `http://localhost`;
      log.info();
      log.info(`👋 ${log.cyan(url)}:${log.magenta(port)}`);
      log.info.gray(`   ${model.mode}`);
      log.info();
    };

    compiler.hooks.afterCompile.tap('DevServer', (compilation) => logListening(true));

    const host = 'localhost';
    const options = { hot: true, host };
    new dev(compiler, options).listen(port, host, () => logListening());
  },
};

/**
 * [Helpers]
 */

const toModel = (input: M) => {
  return (typeof (input as any).toObject === 'function'
    ? (input as any).toObject()
    : input) as t.WebpackModel;
};
const toCompiler = (input: M, options: { mode?: t.WebpackMode } = {}) => {
  const { mode } = options;

  const model = mode ? { ...toModel(input), mode } : toModel(input);

  const config = toWebpackConfig(model);
  const compiler = webpack(config);
  return { model, config, compiler };
};

const toBundled = (model: t.WebpackModel, stats: Stats): t.WebpackBundleResponse => {
  const elapsed = stats.endTime - stats.startTime;
  const ok = !stats.hasErrors();
  return {
    ok,
    elapsed,
    toString: () => stats.toString({ colors: true }),
    stats,
    model,
  };
};
