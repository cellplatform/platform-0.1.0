import { t } from '../common';
import { Rules } from './wp.rules';
import { Plugins } from './wp.plugins';

type M = t.WebpackModel | t.ConfigBuilderChain;

/**
 * Converts a configuration state into a live webpack object.
 */
export function toWebpackConfig(input: M): t.WebpackConfig {
  const model = toModel(input);
  const { mode, port } = model;
  const prod = mode === 'production';
  const publicPath = `http://localhost:${port}/`;

  /**
   * TODO 🐷
   *  - Check tree-shaking (??)
   *
   *  - Entry
   *  - Title
   *
   */

  /**
   * Base configuration.
   */
  const config: t.WebpackConfig = {
    mode,
    output: { publicPath },

    // TEMP 🐷
    entry: { main: './src/test/test.entry.ts', foo: './src/test/test.entry.ts' },

    resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'] },
    devtool: prod ? undefined : 'eval-cheap-module-source-map',
    devServer: prod ? undefined : { port, hot: true },
    module: { rules: Rules.default() },
    plugins: Plugins.init({ model, prod }),
  };

  // Finish up.
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
