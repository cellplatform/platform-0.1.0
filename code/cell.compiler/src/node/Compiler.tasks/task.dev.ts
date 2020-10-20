import DevServer from 'webpack-dev-server';

import { log, Model, t, toModel } from '../common';
import { wp } from '../Config.webpack';
import { logger } from './util';

/**
 * Run dev server.
 */
export const dev: t.CompilerRunDev = async (input) => {
  const obj = toModel(input);
  obj.mode = 'development'; // NB: Always run dev-server in "development" mode.

  const { compiler } = wp.toCompiler(obj, {
    beforeCompile(e) {
      e.modify((webpack) => {
        /**
         * BUG:     HMR fails with an explicitly specified target.
         * ISSUE:   https://github.com/webpack/webpack-dev-server/issues/2758
         * NOTE:
         *          This can be removed later when the up-stream issue is fixed.
         */
        webpack.target = undefined;
      });
    },
  });

  const model = Model(obj);
  const port = model.port();
  let count = 0;

  compiler.hooks.afterCompile.tap('DevServer', (compilation) => {
    count++;
    logger.clear().newline();
    log.info.gray(`DevServer (${count})`);
    logger.model(obj, 2).newline().hr().stats(compilation);
  });

  const host = 'localhost';
  const options = { host, hot: true, stats: false };
  new DevServer(compiler, options).listen(port, host, () => logger.clear());
};