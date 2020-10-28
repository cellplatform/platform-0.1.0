/* eslint-disable @typescript-eslint/no-var-requires */

import { t, ModuleFederationPlugin, encoding, fs, DEFAULT, Model, constants } from '../common';
import HtmlWebPackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

import { DefinePlugin } from 'webpack';

type P = NonNullable<t.WpConfig['plugins']>;
type IArgs = { model: t.CompilerModel; isProd: boolean; isDev: boolean };

export const Plugins = {
  init(args: IArgs): P {
    return [
      Plugins.federation(args),
      Plugins.typeChecker(args),
      Plugins.html(args),
      Plugins.envVariables(args),
    ].filter(Boolean);
  },

  /**
   * Plugin: HTML
   */
  html(args: IArgs) {
    const model = Model(args.model);
    if (model.isNode) {
      return undefined;
    } else {
      const obj = model.toObject();
      const title = obj.title || obj.namespace || 'Untitled';
      return new HtmlWebPackPlugin({ title });
    }
  },

  /**
   * Plugin: Module Federation
   *         https://webpack.js.org/concepts/module-federation/
   */
  federation(args: IArgs) {
    const { model } = args;
    const unescape = (obj?: Record<string, unknown>) =>
      encoding.transformKeys(obj || {}, encoding.unescapePath);

    const name = encoding.escapeNamespace(model.namespace || '');
    if (!name) {
      throw new Error(`Module federation requires a "scope" (namespace) value.`);
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

  /**
   * Plugin: DefinePlugin
   *         https://webpack.js.org/plugins/define-plugin/
   */
  envVariables(args: IArgs) {
    const env = Model(args.model).env;
    return new DefinePlugin({ __CELL_ENV__: JSON.stringify(env) });
  },
};
