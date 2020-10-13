import { t } from './common';

export type WebpackView = 'Default' | 'Null' | '404';
export type WebpackRegion = 'Main';
export type WebpackProps = t.IViewModuleProps<t.WebpackData, WebpackView, WebpackRegion>;
export type WebpackModule = t.IModule<WebpackProps>;

/**
 * Static entry point.
 */
export type Webpack = {
  module(bus: t.EventBus<any>): WebpackModule;
  config: t.ConfigBuilder;
  dev: t.WebpackDev;
  watch: t.WebpackWatch;
  bundle: t.WebpackBundle;
  upload: t.WebpackUpload;
};

/**
 * Webpack module data.
 */
export type WebpackData = { foo?: number };
