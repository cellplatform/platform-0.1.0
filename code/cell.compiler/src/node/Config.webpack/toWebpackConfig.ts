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
    const model = Model(input);
    const data = model.toObject();
    const version = model.version('0.0.0');

    /**
     * Values (with defaults).
     */
    const mode = model.mode();
    const port = model.port();
    const name = model.name();

    const prod = model.isProd;
    const dev = model.isDev;

    const entry = model.entry();
    const target = model.target();
    const path = fs.resolve(model.paths.out.dist);

    const rules = [
      ...Rules.init({ model: data, isProd: prod, isDev: dev }),
      ...model.rules(),
    ].filter(Boolean);

    const plugins = [
      ...Plugins.init({ model: data, isProd: prod, isDev: dev }),
      ...model.plugins(),
    ].filter(Boolean);

    const devServer: t.WpDevServer = {
      port,
      hot: true,
    };

    return {
      name,
      mode,
      output: {
        path,
        filename(fileData) {
          const name = fileData.chunk.name;
          const std = ['worker.service', 'remoteEntry'];
          if (std.includes(name)) return '[name].js';
          return `[name]-${version}.js`;
        },
        chunkFilename: `cell-${version}-[name].js`,
        publicPath: 'auto',
        crossOriginLoading: 'anonymous', // NB: Prevents cross-origin loading problems of code-split JS when doing "federated function" imports.
      },
      entry,
      target,
      resolve: { extensions: ['.tsx', '.ts', '.js', '.json'] },
      devtool: prod ? undefined : 'eval-cheap-module-source-map',
      devServer: prod ? undefined : devServer,
      module: { rules },
      plugins,
      cache: { type: 'filesystem' },
      stats: 'minimal',
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
