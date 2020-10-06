import { t } from './common';

type C = WebpackConfigBuilder;
type O = WebpackConfigBuilderOutput;

/**
 * API: A single complete Webpack configuration.
 */
export type WebpackConfigBuilder = {
  parent(): t.WebpackConfigsBuilder;
  toObject(): t.WebpackConfigData;
  clone(name: string): t.BuilderChain<t.WebpackConfigBuilder>;

  // Props.
  name(value: string): C;
  mode(value: t.WebpackMode | 'prod' | 'dev'): C;
  devtool(value: false | t.WebpackDevtool): C;
  context(value: string | undefined): C;

  output: t.WebpackConfigBuilderOutput;
  resolve: t.WebpackConfigBuilderResolve;
};

/**
 * https://webpack.js.org/concepts/output/
 */
export type WebpackConfigBuilderOutput = {
  parent(): C;
  filename(value: string | undefined): O;
  path(value: string | undefined): O;
  publicPath(value: string | undefined): O;
};

/**
 * https://webpack.js.org/concepts/output/
 */
export type WebpackConfigBuilderResolve = {
  parent(): C;
  extensions(value: string[] | undefined): O;
  // path(value: string | undefined): O;
  // publicPath(value: string | undefined): O;
};
