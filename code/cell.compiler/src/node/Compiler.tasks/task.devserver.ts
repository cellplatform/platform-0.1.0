import DevServer from 'webpack-dev-server';

import { log, Model, t, toModel, logger, port, defaultValue } from '../common';
import { wp } from '../config.webpack';
import { afterCompile } from './util';

const portInUse = async (value: number) => port.isUsed(value, 'localhost');

/**
 * Run dev server.
 */
export const devserver: t.CompilerRunDevserver = async (input, options = {}) => {
  const obj = toModel(input);
  const model = Model(obj);
  const port = defaultValue(options.port, model.port());
  const noExports = options.exports === false;

  if (await portInUse(port)) {
    log.error('ERROR');
    log.info.yellow(`The port ${log.white(port)} is already in use.`);
    log.info();
    return;
  }

  const { compiler, webpack } = wp.toCompiler(obj, {
    beforeCompile(e) {
      e.modifyModel((model) => {
        if (noExports) {
          delete model.exposes; // NB: See bug notes below 🐛.
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
    afterCompile({ model: obj, webpack, compilation });

    count++;
    logger.clear().newline();
    log.info.gray(`DevServer (${count})`);
    logger.model(obj, { indent: 2, url: true, port }).newline();
    logger.exports(obj, { disabled: noExports }).newline();

    if (noExports) {
      /**
       * 🐛
       * BUG:     This is because HMR breaks when reloading if any exports exist.
       * NOTE:    This can be removed later when the up-stream issue is fixed.
       */
      log.info.gray(`NOTE: module federation exports disabled (${log.white('--no-exports')})`);
    } else {
    }

    logger.hr().stats(compilation);
  });

  const host = 'localhost';
  const args = { host, hot: true, stats: false };
  new DevServer(compiler, args).listen(port, host, () => {
    logger.clear();
  });
};
