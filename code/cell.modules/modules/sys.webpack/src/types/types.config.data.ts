import { t } from './common';

/**
 * Map of configuration settings.
 */
export type WebpackConfigs = Record<string, t.WebpackConfigData>;

/**
 * Single webpack configuration.
 */
export type WebpackConfigData = {
  name: string;
  mode: t.WebpackMode;
  devTool?: false | t.WebpackDevtool;
  context?: string;
  output?: t.WebpackConfigDataOutput;
  resolve?: t.WebpackConfigDataResolve;
};

/**
 * https://webpack.js.org/concepts/output/
 */
export type WebpackConfigDataOutput = {
  filename?: string;
  path?: string;
  publicPath?: string;
};

/**
 * https://webpack.js.org/configuration/resolve/
 */
export type WebpackConfigDataResolve = {
  extensions?: string[];
};

/**
 * https://webpack.js.org/configuration/dev-server/
 */
export type WebpackConfigDataDevServer = {};

// export type WebpackConfigData = {}
