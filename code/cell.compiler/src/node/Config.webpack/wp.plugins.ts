/* eslint-disable @typescript-eslint/no-var-requires */

import { t, ModuleFederationPlugin, encoding, fs, DEFAULT } from '../common';
import HtmlWebPackPlugin from 'html-webpack-plugin';

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

type P = NonNullable<t.WpConfig['plugins']>;
type IArgs = { model: t.CompilerModel; prod: boolean; dev: boolean };

export const Plugins = {
  init(args: IArgs): P {
    const plugins = [Plugins.html(args), Plugins.federation(args), Plugins.typeChecker(args)];
    return plugins.filter(Boolean);
  },

  /**
   * Plugin: HTML
   */
  html(args: IArgs) {
    const { model } = args;
    const title = model.title || model.scope || 'Untitled';
    return new HtmlWebPackPlugin({ title });
  },

  /**
   * Plugin: Module Federation
   *         https://webpack.js.org/concepts/module-federation/
   */
  federation(args: IArgs) {
    const { model } = args;
    const unescape = (obj?: Record<string, unknown>) =>
      encoding.transformKeys(obj || {}, encoding.unescapePath);

    const name = encoding.escapeScope(model.scope || '');
    if (!name) {
      throw new Error(`Module federation requires a "scope" value.`);
    }

    return new ModuleFederationPlugin({
      name,
      filename: DEFAULT.FILE.JS.REMOTE_ENTRY,
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
