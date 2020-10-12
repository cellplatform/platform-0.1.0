import { t, DEFAULT } from '../common';
import { Rules } from './wp.rules';
import { Plugins } from './wp.plugins';

import { stats } from './wp.stats';
export { stats };

type M = t.WebpackModel | t.ConfigBuilderChain;

/**
 * Converts a configuration state into a live webpack object.
 */
export function toWebpackConfig(input: M): t.WpConfig {
  const model = toModel(input);
  const { mode, port, name } = model;
  const prod = mode === 'production';
  const publicPath = toPublicPath(model);

  /**
   * Base configuration.
   */
  const config: t.WpConfig = {
    name,
    mode,
    output: { publicPath },
    entry: model.entry,
    target: model.target,
    resolve: { extensions: ['.tsx', '.ts', '.js'] },
    devtool: prod ? undefined : 'eval-cheap-module-source-map',
    devServer: prod ? undefined : { port, hot: true },
    module: { rules: Rules.default() },
    plugins: Plugins.init({ model, prod }),
    cache: { type: 'filesystem' },
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

export function toPublicPath(model: t.WebpackModel) {
  const { host = DEFAULT.CONFIG.host, port = DEFAULT.CONFIG.port } = model;
  let url = host;
  url = port !== 80 ? `${url}:${port}` : url;
  return `${url}/`;
}
