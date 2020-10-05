import { t } from './common';

export type WebpackMode = 'production' | 'development';

/**
 * State
 */
export type WebpackConfigData = {
  name: string;
  mode: WebpackMode;
};

/**
 * A single complete Webpack configuration.
 */
export type WebpackConfigBuilder = {
  name(value: string): WebpackConfigBuilder;
  mode(value: WebpackMode): WebpackConfigBuilder;
};
