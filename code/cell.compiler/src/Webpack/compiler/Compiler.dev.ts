import * as DevServer from 'webpack-dev-server';

import { log, t } from '../common';
import { wp } from '../config.wp';
import * as util from './util';

/**
 * Run dev server.
 */
export const dev: t.WebpackDev = async (input) => {
  const model = wp.toModel(input);
  model.mode = 'development'; // NB: Always run dev-server in "development" mode.
  model.target = undefined; //   BUG: HMR fails with an explicitly specified target. https://github.com/webpack/webpack-dev-server/issues/2758

  const { compiler } = util.toCompiler(model);
  const port = model.port;
  let count = 0;

  compiler.hooks.afterCompile.tap('DevServer', (compilation) => {
    count++;
    util.logger.clear().newline();
    log.info.gray(`DevServer (${count})`);
    util.logger.model(model, 2).newline().hr().stats(compilation);
  });

  const host = 'localhost';
  const options = { host, hot: true, stats: false };
  new DevServer(compiler, options).listen(port, host, () => util.logger.clear());
};
