import { Model, t, toModel, fs } from '../common';
import { Plugins } from './wp.plugins';
import { Rules } from './wp.rules';
import { beforeCompile } from './hooks';

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

    const devServer: t.WpDevServer = { port, hot: true };

    return {
      name,
      mode,
      output: { publicPath: 'auto', path },
      entry,
      target,
      resolve: { extensions: ['.tsx', '.ts', '.js', '.json'] },
      devtool: prod ? undefined : 'eval-cheap-module-source-map',
      devServer: prod ? undefined : devServer,
      module: { rules },
      plugins,
      cache: { type: 'filesystem' },
    };
  };

  /**
   * Run any modifier hooks that may have been attached
   * within the calling configuration setup.
   */
  const { webpack } = beforeCompile({
    toConfig,
    model: toModel(input),
    handlers: options.beforeCompile ? [options.beforeCompile] : undefined,
  });

  // Finish up.
  return webpack;
}
