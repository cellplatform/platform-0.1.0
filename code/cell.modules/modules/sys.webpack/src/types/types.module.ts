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
  bundle: t.WebpackBundle;
  watch: t.WebpackWatch;
  dev: t.WebpackDev;
};

/**
 * Webpack module data.
 */
export type WebpackData = { foo?: number };
