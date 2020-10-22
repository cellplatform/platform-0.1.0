import { Model, t, StateObject, toModel } from '../common';
import { Plugins } from './wp.plugins';
import { Rules } from './wp.rules';

type M = t.CompilerModel | t.CompilerModelBuilder;

/**
 * Converts a configuration state into a live Webpack object.
 */
export function toWebpackConfig(
  input: M,
  options: { beforeCompile?: t.BeforeCompile } = {},
): t.WpConfig {
  const toConfig = (input: t.CompilerModel): t.WpConfig => {
    const settings = Model(input);
    const model = settings.toObject();

    /**
     * Values (with defaults).
     */
    const mode = settings.mode();
    const port = settings.port();
    const name = settings.name();

    const prod = settings.prod;
    const dev = settings.dev;

    const entry = settings.entry();
    const target = settings.target();

    const dir = settings.dir();
    const path = `${dir}/${target.join(',')}`;

    const rules = [...Rules.init({ model, prod, dev }), ...settings.rules()].filter(Boolean);
    const plugins = [...Plugins.init({ model, prod, dev }), ...settings.plugins()].filter(Boolean);

    return {
      name,
      mode,
      output: { publicPath: 'auto', path },
      entry,
      target,
      resolve: { extensions: ['.tsx', '.ts', '.js', '.json'] },
      devtool: prod ? undefined : 'eval-cheap-module-source-map',
      devServer: prod ? undefined : { port, hot: true },
      module: { rules },
      plugins,
      cache: { type: 'filesystem' },
    };
  };

  let model = toModel(input);
  let config = toConfig(model);

  /**
   * Run any modifier hooks that may have been attached
   * within the calling configuration setup.
   */
  // const obj = settings.toObject();
  const before = [...(model.beforeCompile || [])];
  if (options.beforeCompile) {
    before.unshift(options.beforeCompile);
  }
  if (before.length > 0) {
    const e: t.BeforeCompileArgs = {
      model,
      toObject: StateObject.toObject,
      modifyModel(fn) {
        const obj = StateObject.create<t.CompilerModel>(model);
        obj.change(fn);
        model = obj.state;
        config = toConfig(obj.state);
      },
      modifyWebpack(fn) {
        const obj = StateObject.create<t.WpConfig>(config);
        obj.change(fn);
        config = obj.state;
      },
    };
    before.forEach((fn) => fn(e));
  }

  // Finish up.
  return config;
}
