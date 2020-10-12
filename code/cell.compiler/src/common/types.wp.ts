import { t } from '../common';

/**
 * A [WebPack] configuration object.
 * https://webpack.js.org/configuration
 */
export type WpConfig = {
  mode?: t.WpMode;
  entry?: string | Record<string, string>;
  output?: WpConfigOutput;
  resolve?: WpConfigResolve;
  devtool?: WpDevtool;
  devServer?: WpConfigDevServer;
  module?: WpConfigModule;
  plugins?: any[];
};

/**
 * https://webpack.js.org/configuration/output
 */
export type WpConfigOutput = { filename?: string; path?: string; publicPath?: string };

/**
 * https://webpack.js.org/configuration/resolve
 */
export type WpConfigResolve = { extensions?: string[] };

/**
 * https://webpack.js.org/configuration/module/
 */
export type WpConfigModule = { rules?: WpConfigRule[] };

/**
 * https://webpack.js.org/configuration/module/#rule
 */
export type WpConfigRule = {
  test?: RegExp;
  mimetype?: string;
  exclude?: RegExp;
  use?: WpConfigRuleUse | WpConfigRuleUse[];
};

export type WpConfigRuleUse = string | WpConfigLoader;

export type WpConfigLoader = {
  loader: string;
  options?: Record<string, any>;
};

/**
 * https://webpack.js.org/configuration/dev-server
 */
export type WpConfigDevServer = {
  host?: string;
  port?: number;
  contentBase?: string;
  compress?: boolean;
  allowedHosts?: string[];
  clientLogLevel?: WpLogLevel;
  filename?: string;
  headers?: Record<string, string>;
  hot?: boolean;
};

/**
 * https://webpack.js.org/configuration/mode
 */
export type WpMode = 'production' | 'development';

/**
 * https://webpack.js.org/configuration/devtool
 */
export type WpDevtool =
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
export type WpLogLevel = 'info' | 'silent' | 'trace' | 'debug' | 'info' | 'warn' | 'error';
