import { Model, t } from '../common';
import { Plugins } from './wp.plugins';
import { Rules } from './wp.rules';
import { stats } from './wp.stats';

export { stats };

type M = t.CompilerWebpackModel | t.CompilerConfig;

/**
 * Converts a configuration state into a live webpack object.
 */
export function toWebpackConfig(input: M): t.WpConfig {
  const model = Model(input);

  const mode = model.mode();
  const port = model.port();
  const name = model.name();
  const path = model.dir();
  const publicPath = model.url();
  const prod = model.prod;

  const entry = model.entry();
  const target = model.target();
  const rules = [...Rules.default(), ...model.rules()];

  /**
   * Base configuration.
   */
  const config: t.WpConfig = {
    name,
    mode,
    output: { publicPath, path },
    entry,
    target,
    resolve: { extensions: ['.tsx', '.ts', '.js'] },
    devtool: prod ? undefined : 'eval-cheap-module-source-map',
    devServer: prod ? undefined : { port, hot: true },
    module: { rules },
    plugins: Plugins.init({ model: model.toObject(), prod }),
    cache: { type: 'filesystem' },
  };

  // Finish up.
  return config;
}
