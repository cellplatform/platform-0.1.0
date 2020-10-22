import DevServer from 'webpack-dev-server';

import { log, Model, t, toModel } from '../common';
import { wp } from '../Config.webpack';
import { logger } from './util';

/**
 * Run dev server.
 */
export const dev: t.CompilerRunDev = async (input) => {
  const obj = toModel(input);
  const model = Model(obj);
  const port = model.port();
  const isDev = model.mode() === 'development';

  const { compiler } = wp.toCompiler(obj, {
    beforeCompile(e) {
      e.modifyModel((model) => {
        if (isDev) {
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
    count++;
    logger.clear().newline();
    log.info.gray(`DevServer (${count})`);
    logger.model(obj, { indent: 2, url: true }).newline();

    if (isDev) {
      /**
       * 🐛
       * BUG:     This is because HMR breaks when reloading if any exports exist.
       * NOTE:    This can be removed later when the up-stream issue is fixed.
       */
      log.info.gray(`NB: module federation "exposes" disabled while in development mode`);
    }

    logger.hr().stats(compilation);
  });

  const host = 'localhost';
  const options = { host, hot: true, stats: false };
  new DevServer(compiler, options).listen(port, host, () => logger.clear());
};
