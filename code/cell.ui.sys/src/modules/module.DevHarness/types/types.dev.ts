import { t } from '../common';

/**
 * Dev Module
 * (the module that defines the UI tests)
 */

export type DevView = 'HOST/component' | 'HOST/module' | '404';
export type DevData = { host?: t.DevHost };
export type DevProps = t.IViewModuleProps<DevData, DevView>;
export type DevModule = t.IModule<DevProps>;

/**
 * The data configuration of a component being hosted.
 */
export type DevHost = {
  view?: string;
  layout?: DevHostLayout;
};

/**
 * The layout configuration of a component being hosted.
 */
export type DevHostLayout = {
  width?: number | string;
  height?: number | string;
};
