import { Model, t } from '../common';
import { Plugins } from './wp.plugins';
import { Rules } from './wp.rules';
import { stats } from './wp.stats';

export { stats };

type M = t.WebpackModel | t.ConfigBuilderChain;

/**
 * Converts a configuration state into a live webpack object.
 */
export function toWebpackConfig(input: M): t.WpConfig {
  // const model = toModel(input);
  const model = Model(input);
  // const { mode, port, name } = model;
  const mode = model.mode();
  const port = model.port();
  const name = model.name();
  const prod = model.prod;
  const dir = model.dir();

  // TEMP 🐷
  // const publicPath = toPublicPath(model.toObject());
  const publicPath = model.url();
  // const publicPath = 'http://localhost:5000/cell:ckg2nl70400001wethqd5e0ry:A1/file/';

  /**
   * Base configuration.
   */
  const config: t.WpConfig = {
    name,
    mode,
    output: { publicPath, path: dir },
    entry: model.entry(),
    target: model.target(),
    resolve: { extensions: ['.tsx', '.ts', '.js'] },
    devtool: prod ? undefined : 'eval-cheap-module-source-map',
    devServer: prod ? undefined : { port, hot: true },
    module: { rules: Rules.default() },
    plugins: Plugins.init({ model: model.toObject(), prod }),
    cache: { type: 'filesystem' },
  };

  // Finish up.
  return config;
}
