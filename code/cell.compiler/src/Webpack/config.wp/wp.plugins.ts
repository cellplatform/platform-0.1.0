/* eslint-disable @typescript-eslint/no-var-requires */

import { t, ModuleFederationPlugin, unescapeKeyPaths, fs } from '../common';
import * as HtmlWebPackPlugin from 'html-webpack-plugin';

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

type P = NonNullable<t.WpConfig['plugins']>;
type IArgs = { model: t.WebpackModel; prod: boolean };

export const Plugins = {
  init(args: IArgs): P {
    const plugins = [Plugins.html(args), Plugins.federation(args), Plugins.typeChecker(args)];
    return plugins.filter((plugin) => Boolean(plugin));
  },

  /**
   * Plugin: HTML
   */
  html(args: IArgs) {
    const { model } = args;
    const title = model.title || model.name || 'Untitled';
    return new HtmlWebPackPlugin({ title });
  },

  /**
   * Plugin: Module Federation
   *         https://webpack.js.org/concepts/module-federation/
   */
  federation(args: IArgs) {
    const { model } = args;
    const unescape = (obj?: Record<string, unknown>) => unescapeKeyPaths(obj || {});
    return new ModuleFederationPlugin({
      name: model.name,
      filename: 'remoteEntry.js',
      remotes: unescape(model.remotes),
      exposes: unescape(model.exposes),
      shared: unescape(model.shared),
    });
  },

  /**
   * Plugin: ForkTsCheckerWebpackPlugin
   *         https://github.com/TypeStrong/fork-ts-checker-webpack-plugin
   */
  typeChecker(args: IArgs) {
    const { model } = args;
    const lintFileExists = fs.pathExistsSync(fs.resolve('./.eslintrc.js'));
    const lintEnabled = lintFileExists && model.lint !== false;

    return new ForkTsCheckerWebpackPlugin({
      /**
       * https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#eslint
       */
      eslint: lintEnabled ? { files: 'src/**/*.ts{,x}' } : undefined,

      /**
       * https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#typescript-options
       */
      typescript: { mode: 'write-references' },

      /**
       * https://babeljs.io/docs/en/babel-code-frame#options
       */
      formatter: {
        type: 'codeframe',
        options: {
          linesAbove: 2,
          linesBelow: 3,
        },
      },
    });
  },
};
