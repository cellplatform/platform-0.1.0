import { t } from '../common';
import * as HtmlWebPackPlugin from 'html-webpack-plugin';
import * as ESLintPlugin from 'eslint-webpack-plugin';
import { rules } from './wp.rules';

type M = t.WebpackModel | t.ConfigBuilderChain;

/**
 * Converts a configuration state into a live webpack object.
 */
export function toWebpackConfig(input: M): t.WebpackConfig {
  const model = toModel(input);
  const { mode, port } = model;
  const prod = mode === 'production';
  const publicPath = `http://localhost:${port}/`;
  const plugins: NonNullable<t.WebpackConfig['plugins']> = [];

  /**
   * TODO 🐷
   *  - Check tree-shaking (??)
   *
   *  - Entry
   *  - Title
   *
   * - fork-ts-checker-webpack-plugin
   *      https://webpack.js.org/guides/build-performance/#typescript-loader
   *      https://github.com/TypeStrong/fork-ts-checker-webpack-plugin
   */

  /**
   * Base configuration.
   */
  const config: t.WebpackConfig = {
    mode,
    output: { publicPath },

    // TEMP 🐷
    entry: { main: './src/test/test.entry.ts' },

    resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'] },
    devtool: prod ? undefined : 'eval-cheap-module-source-map',
    devServer: prod ? undefined : { port, hot: true },
    module: { rules },
    plugins,
  };

  /**
   * Plugin: HTML
   */
  plugins.push(new HtmlWebPackPlugin({ title: 'Untitled' }));

  /**
   * Plugin: Linter
   */
  if (model.lint !== false && (model.lint === true || prod)) {
    // @ts-ignore
    plugins.push(new ESLintPlugin({ files: ['src'], extensions: ['ts', 'tsx'] }));
  }

  // Finish up.
  config.plugins = plugins.filter((plugin) => Boolean(plugin));
  return config;
}

/**
 * Wrangle objects types into a [model].
 */
export const toModel = (input: M) => {
  return (typeof (input as any).toObject === 'function'
    ? (input as any).toObject()
    : input) as t.WebpackModel;
};
