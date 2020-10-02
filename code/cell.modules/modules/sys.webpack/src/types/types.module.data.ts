import { t } from './common';

/**
 * Webpack module data.
 */
export type WebpackData = { configs: WebpackDataConfig[] };

/**
 * Configuration state.
 */
export type WebpackDataConfig = {
  name: string;
};
