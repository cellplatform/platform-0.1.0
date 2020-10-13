import { t } from './common';

/**
 * Static entry point.
 */
export type Webpack = {
  config: t.ConfigBuilder;
  dev: t.WebpackDev;
  watch: t.WebpackWatch;
  bundle: t.WebpackBundle;
  upload: t.WebpackUpload;
  cell: t.WebpackCell;
};

/**
 * Webpack module data.
 */
export type WebpackData = { foo?: number };
