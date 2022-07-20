import DevServer from 'webpack-dev-server';

import { log, Model, t, toModel, Logger, Port, defaultValue, fs } from '../common';
import { wp } from '../config.webpack';
import { afterCompile } from './util';

const portInUse = async (value: number) => Port.isUsed(value, 'localhost');

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
         *
         * NOTE (Aug-31-2021) - looks like "webpack-dev-server@4.0.0" fixed the issue.
         */
        // webpack.target = undefined;
      });
    },
  });

  let count = 0;

  compiler.hooks.afterCompile.tap('DevServer', async (compilation) => {
    afterCompile({ model: obj, webpack, compilation });

    const info = wp.stats(compilation);
    count++;

    Logger.clear().newline();
    log.info.gray(`DevServer (${count})`);
    Logger.model(obj, { indent: 2, url: true, port }).newline();
    Logger.exports(obj, { disabled: noExports }).newline();

    if (noExports) {
      /**
       * 🐛
       * BUG:     This is because HMR breaks when reloading if any exports exist.
       * NOTE:    This can be removed later when the up-stream issue is fixed.
       */
      log.info.gray(`NOTE: module federation exports disabled (${log.white('--no-exports')})`);
    } else {
    }

    Logger.hr();
    log.info();
    if (info.errors.length > 0) Logger.errors(info.errors);
  });

  const config: DevServer.Configuration = {
    port,
    host: 'localhost',
    hot: true,
    client: { overlay: { warnings: false, errors: false } },
    static: model
      .static()
      .map(({ dir }) => dir as string)
      .filter(Boolean)
      .map((directory) => ({
        directory,
        publicPath: directory.substring(fs.resolve('').length),
        serveIndex: true,
      })),
  };

  const server = new DevServer(config, compiler);
  await server.start();
};
