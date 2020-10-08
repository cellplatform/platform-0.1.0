import { t } from '../common';
import * as HtmlWebPackPlugin from 'html-webpack-plugin';
import * as ESLintPlugin from 'eslint-webpack-plugin';

/* eslint-disable */
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
/* eslint-enable */

type P = NonNullable<t.WebpackConfig['plugins']>;
type IArgs = { model: t.WebpackModel; prod: boolean };

export const Plugins = {
  init(args: IArgs): P {
    const plugins = [Plugins.html(args), Plugins.linter(args), Plugins.federation(args)];
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
   * Plugin: Linter
   */
  linter(args: IArgs) {
    return args.model.lint !== false && (args.model.lint === true || args.prod)
      ? // @ts-ignore
        new ESLintPlugin({ files: ['src'], extensions: ['ts', 'tsx'] })
      : undefined;
  },

  /**
   * Plugin: Module Federation
   */
  federation(args: IArgs) {
    const { model } = args;
    return new ModuleFederationPlugin({
      name: model.name,
      filename: 'remoteEntry.js',
      remotes: {},
      exposes: {
        './Foo': './src/test/entry',
      },
      shared: {},
    });
  },
};
