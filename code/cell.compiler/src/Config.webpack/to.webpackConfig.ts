import { Model, t, StateObject } from '../common';
import { Plugins } from './wp.plugins';
import { Rules } from './wp.rules';
import produce from 'immer';

type M = t.CompilerWebpackModel | t.CompilerConfig;

/**
 * Converts a configuration state into a live Webpack object.
 */
export function toWebpackConfig(
  input: M,
  options: { beforeCompile?: t.BeforeCompile } = {},
): t.WpConfig {
  const model = Model(input);

  /**
   * Values (with defaults).
   */
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
  let config: t.WpConfig = {
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

  /**
   * Run any modifier hooks.
   */
  const obj = model.toObject();
  const before = [...(obj.beforeCompile || [])];
  if (options.beforeCompile) {
    before.unshift(options.beforeCompile);
  }
  if (before.length > 0) {
    const e: t.BeforeCompileArgs = {
      model: obj,
      toObject: StateObject.toObject,
      modify(fn) {
        config = produce(config, (webpack) => {
          fn(webpack);
          return undefined; // NB: Do not consider the return value as a change (immer).
        });
      },
    };
    before.forEach((fn) => fn(e));
  }

  // Finish up.
  return config;
}
