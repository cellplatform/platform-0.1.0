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
  const settings = Model(input);
  const model = settings.toObject();

  /**
   * Values (with defaults).
   */
  const mode = settings.mode();
  const port = settings.port();
  const name = settings.name();
  const path = settings.dir();
  const publicPath = settings.url();

  const prod = settings.prod;
  const dev = settings.dev;

  const entry = settings.entry();
  const target = settings.target();

  const rules = [...Rules.init({ model, prod, dev }), ...settings.rules()].filter(Boolean);
  const plugins = [...Plugins.init({ model, prod, dev }), ...settings.plugins()].filter(Boolean);

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
    plugins,
    cache: { type: 'filesystem' },
  };

  /**
   * Run any modifier hooks.
   */
  const obj = settings.toObject();
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
