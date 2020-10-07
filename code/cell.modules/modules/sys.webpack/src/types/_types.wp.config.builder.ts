import { t } from './common';

type C = _WebpackConfigBuilder;
type O = _WebpackConfigBuilderOutput;

/**
 * Factor for creating a [Webpack] configuration builder.
 */
export type WebpackConfigsBuilderFactory = (
  bus: t.EventBus,
  webpack: t.IModule,
) => t.WebpackConfigsBuilder;

/**
 * Root builder of a set of Webpack configurations.
 */
export type WebpackConfigsBuilder = {
  toObject(): t._WebpackConfigs;
  name: t.BuilderMap<t._WebpackConfigBuilder, string, { initial?: t._WebpackConfigData }>;
};

/**
 * API: A single complete Webpack configuration.
 */
export type _WebpackConfigBuilder = {
  parent(): t.WebpackConfigsBuilder;
  toObject(): t._WebpackConfigData;
  clone(name: string): t.BuilderChain<t._WebpackConfigBuilder>;

  // Props.
  name(value: string): C;
  mode(value: t.WebpackMode | 'prod' | 'dev'): C;
  devTool(value: false | t.WebpackDevtool): C;
  context(value: string | undefined): C;

  output: t._WebpackConfigBuilderOutput;
  resolve: t._WebpackConfigBuilderResolve;
  devServer: t._WebpackConfigBuilderDevServer;
};

/**
 * https://webpack.js.org/concepts/output/
 */
export type _WebpackConfigBuilderOutput = {
  parent(): C;
  filename(value: string | undefined): O;
  path(value: string | undefined): O;
  publicPath(value: string | undefined): O;
};

/**
 * https://webpack.js.org/concepts/output/
 */
export type _WebpackConfigBuilderResolve = {
  parent(): C;
  extensions(value: string[] | undefined): O;
};

/**
 * https://webpack.js.org/configuration/dev-server/
 */
export type _WebpackConfigBuilderDevServer = {
  parent(): C;
  port(value: number | undefined): O;
};
