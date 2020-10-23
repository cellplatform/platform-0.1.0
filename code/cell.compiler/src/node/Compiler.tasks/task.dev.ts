import DevServer from 'webpack-dev-server';

import { log, Model, t, toModel } from '../common';
import { wp } from '../Config.webpack';
import { logger, afterCompile } from './util';

/**
 * Run dev server.
 */
export const dev: t.CompilerRunDev = async (input, options = {}) => {
  const obj = toModel(input);
  const model = Model(obj);
  const port = model.port();
  const noExports = options.exports === false;

  const { compiler, config } = wp.toCompiler(obj, {
    beforeCompile(e) {
      e.modifyModel((model) => {
        if (noExports) {
          delete model.exposes; // NB: See bug notes below 🐛
        }
      });

      e.modifyWebpack((webpack) => {
        /**
         * 🐛
         * BUG:     HMR fails with an explicitly specified target.
         * ISSUE:   https://github.com/webpack/webpack-dev-server/issues/2758
         * NOTE:
         *          This can be removed later when the up-stream issue is fixed.
         */
        webpack.target = undefined;
      });
    },
  });

  let count = 0;

  compiler.hooks.afterCompile.tap('DevServer', (compilation) => {
    afterCompile({ model: obj, webpack: config, compilation });

    count++;
    logger.clear().newline();
    log.info.gray(`DevServer (${count})`);
    logger.model(obj, { indent: 2, url: true }).newline();

    if (noExports) {
      /**
       * 🐛
       * BUG:     This is because HMR breaks when reloading if any exports exist.
       * NOTE:    This can be removed later when the up-stream issue is fixed.
       */
      log.info.gray(`NB: module federation exports disabled (${log.white('--no-exports')})`);
    }

    logger.hr().stats(compilation);
  });

  const host = 'localhost';
  const args = { host, hot: true, stats: false };
  new DevServer(compiler, args).listen(port, host, () => logger.clear());
};
