import { t } from '../common';

/**
 * A [WebPack] configuration object.
 * https://webpack.js.org/configuration
 */
export type WebpackConfig = {
  mode?: t.WebpackMode;
  entry?: string | Record<string, string>;
  output?: WebpackConfigOutput;
  resolve?: WebpackConfigResolve;
  devtool?: WebpackDevtool;
  devServer?: WebpackConfigDevServer;
  module?: WebpackConfigModule;
  plugins?: any[];
};

/**
 * https://webpack.js.org/configuration/output
 */
export type WebpackConfigOutput = { filename?: string; path?: string; publicPath?: string };

/**
 * https://webpack.js.org/configuration/resolve
 */
export type WebpackConfigResolve = { extensions?: string[] };

/**
 * https://webpack.js.org/configuration/module/
 */
export type WebpackConfigModule = { rules?: WebpackConfigRule[] };

/**
 * https://webpack.js.org/configuration/module/#rule
 */
export type WebpackConfigRule = {
  test?: RegExp;
  mimetype?: string;
  exclude?: RegExp;
  use?: WebpackConfigRuleUse | WebpackConfigRuleUse[];
};

export type WebpackConfigRuleUse = string | WebpackConfigLoader;

export type WebpackConfigLoader = {
  loader: string;
  options?: Record<string, any>;
};

/**
 * https://webpack.js.org/configuration/dev-server
 */
export type WebpackConfigDevServer = {
  host?: string;
  port?: number;
  contentBase?: string;
  compress?: boolean;
  allowedHosts?: string[];
  clientLogLevel?: WebpackLogLevel;
  filename?: string;
  headers?: Record<string, string>;
  hot?: boolean;
};

/**
 * https://webpack.js.org/configuration/mode
 */
export type WebpackMode = 'production' | 'development';

/**
 * https://webpack.js.org/configuration/devtool
 */
export type WebpackDevtool =
  | 'eval'
  | 'eval-cheap-source-map'
  | 'eval-cheap-module-source-map'
  | 'eval-source-map'
  | 'eval-nosources-source-map'
  | 'eval-nosources-cheap-source-map'
  | 'eval-nosources-cheap-module-source-map'
  | 'cheap-source-map'
  | 'cheap-module-source-map'
  | 'inline-cheap-source-map'
  | 'inline-cheap-module-source-map'
  | 'inline-source-map'
  | 'inline-nosources-source-map'
  | 'inline-nosources-cheap-source-map'
  | 'inline-nosources-cheap-module-source-map'
  | 'source-map'
  | 'hidden-source-map'
  | 'hidden-nosources-source-map'
  | 'hidden-nosources-cheap-source-map'
  | 'hidden-nosources-cheap-module-source-map'
  | 'hidden-cheap-source-map'
  | 'hidden-cheap-module-source-map'
  | 'nosources-source-map'
  | 'nosources-cheap-source-map'
  | 'nosources-cheap-module-source-map';

/**
 * https://webpack.js.org/configuration/dev-server/#devserverclientloglevel
 */
export type WebpackLogLevel = 'info' | 'silent' | 'trace' | 'debug' | 'info' | 'warn' | 'error';
