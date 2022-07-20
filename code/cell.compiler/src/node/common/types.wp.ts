import { Compiler, Compilation, Stats } from 'webpack';

export type WpCompilation = Compilation;
export type WpStats = Stats;

/**
 * Direct wrapper of Webpack
 * [Not Publicly Exported]
 */

/**
 * A [WebPack] configuration object.
 * https://webpack.js.org/configuration
 */
export type WpConfig = {
  name?: string;
  mode?: WpMode;
  target?: WpTarget;
  entry?: string | Record<string, string>;
  output?: WpOutput;
  resolve?: WpResolve;
  devtool?: WpDevtool;
  devServer?: WpDevServer;
  module?: WpModule;
  plugins?: WpPlugin[];
  cache?: false | WpCache;
  optimization?: WpOptimization;
  stats?: WpStatsPresets;
};

export type WpStatsPresets =
  | 'none'
  | 'errors-only'
  | 'errors-warnings'
  | 'minimal'
  | 'none'
  | 'normal'
  | 'verbose'
  | 'detailed'
  | 'summary';

/**
 * https://webpack.js.org/configuration/other-options/#cache
 */
export type WpCache = {
  type: 'filesystem' | 'memory';
  cacheDirectory?: string;
  cacheLocation?: string;
  buildDependencies?: Record<string, [string]>;
};

/**
 * https://webpack.js.org/configuration/target
 */
export type WpTarget = string | string[] | false;

/**
 * https://webpack.js.org/configuration/output
 */
export type WpOutput = {
  path?: string;
  publicPath?: string;
  crossOriginLoading?: false | 'anonymous' | 'use-credentials';
  filename?: string | ((data: WpPathData) => string);
  chunkFilename?: string | ((data: WpPathData) => string);
};

/**
 * https://webpack.js.org/configuration/resolve
 */
export type WpResolve = { extensions?: string[] };

/**
 * https://webpack.js.org/configuration/module/
 */
export type WpModule = { rules?: WpRule[] };

/**
 * https://webpack.js.org/configuration/module/#rule
 */
export type WpRule = {
  test?: RegExp;
  mimetype?: string;
  exclude?: RegExp;
  use?: WpRuleUse | WpRuleUse[];
};

export type WpRuleUse = string | WpLoader;

export type WpLoader = {
  loader: string;
  options?: Record<string, any>;
};

/**
 * https://webpack.js.org/configuration/dev-server
 */
export type WpDevServer = {
  host?: string;
  port?: number;
  contentBase?: string | string[];
  contentBasePublicPath?: string | string[];
  compress?: boolean;
  allowedHosts?: string[];
  clientLogLevel?: WpLogLevel;
  filename?: string;
  headers?: Record<string, string>;
  hot?: boolean;
};

/**
 * https://webpack.js.org/configuration/optimization
 */
export type WpOptimization = {
  minimize?: boolean;
  minimizer?: (WpPlugin | WpPluginFactory)[];
  emitOnErrors?: boolean;
  nodeEnv?: false | string;
  mangleWasmImports?: boolean;
  removeAvailableModules?: boolean;
  removeEmptyChunks?: boolean;
  mergeDuplicateChunks?: boolean;
  flagIncludedChunks?: boolean;
  occurrenceOrder?: boolean;
  providedExports?: boolean;
  usedExports?: boolean | 'global';
  concatenateModules?: boolean;
  sideEffects?: boolean;
  portableRecords?: boolean;
  mangleExports?: boolean | 'deterministic' | 'size';
  innerGraph?: boolean;
  realContentHash?: boolean;
};

/**
 * https://webpack.js.org/configuration/plugins
 */
export type WpPlugin = any;
export type WpPluginFactory = (compiler: Compiler) => WpPlugin;

/**
 * https://webpack.js.org/configuration/mode
 */
export type WpMode = 'production' | 'development';

/**
 * https://webpack.js.org/configuration/output/#outputfilename
 */
export type WpPathData = { hash: string; runtime: string; chunk: WpChunkPathData };
export type WpChunkPathData = { id: number; name: string; hash: string };

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
