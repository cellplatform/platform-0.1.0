import { t, DEFAULT, fs, toModel } from '../common';
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
  const dir = model.dir ? fs.resolve(model.dir) : undefined;

  // TEMP 🐷
  const publicPath = toPublicPath(model);
  // const publicPath = 'http://localhost:5000/cell:ckg2nl70400001wethqd5e0ry:A1/file/';

  /**
   * Base configuration.
   */
  const config: t.WpConfig = {
    name,
    mode,
    output: { publicPath, path: dir },
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
 * Derive the public path (URL).
 */
export function toPublicPath(model: t.WebpackModel) {
  const { host = DEFAULT.CONFIG.host, port = DEFAULT.CONFIG.port } = model;
  let url = host;
  url = port !== 80 ? `${url}:${port}` : url;
  return `${url}/`;
}
