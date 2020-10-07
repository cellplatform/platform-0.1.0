import { t } from './common';

/**
 * Map of configuration settings.
 */
export type _WebpackConfigs = Record<string, t._WebpackConfigData>;

/**
 * Single webpack configuration.
 */
export type _WebpackConfigData = {
  name: string;
  mode: t.WebpackMode;
  context?: string;
  output?: t._WebpackConfigDataOutput;
  resolve?: t._WebpackConfigDataResolve;
  devServer?: t._WebpackConfigDataDevServer;
  devTool?: false | t.WebpackDevtool;
};

/**
 * https://webpack.js.org/concepts/output/
 */
export type _WebpackConfigDataOutput = {
  filename?: string;
  path?: string;
  publicPath?: string;
};

/**
 * https://webpack.js.org/configuration/resolve/
 */
export type _WebpackConfigDataResolve = {
  extensions?: string[];
};

/**
 * https://webpack.js.org/configuration/dev-server/
 */
export type _WebpackConfigDataDevServer = {
  port?: number;
};
