import { t } from './common';

type C = WebpackConfigBuilder;

export type WebpackConfigs = Record<string, t.WebpackConfigData>;

/**
 * State
 */
export type WebpackConfigData = {
  name: string;
  mode: t.WebpackMode;
  devTool?: false | t.WebpackDevtool;
};

/**
 * A single complete Webpack configuration.
 */
export type WebpackConfigBuilder = {
  toObject(): WebpackConfigData;
  clone(name: string): t.BuilderChain<WebpackConfigBuilder>;

  // Props.
  name(value: string): C;
  mode(value: t.WebpackMode | 'prod' | 'dev'): C;
  devtool(value: false | t.WebpackDevtool): C;
};
