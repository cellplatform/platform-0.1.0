import { ModuleApp as App } from '../Module.App';
import { DEFAULT, FC, LoadMask, ModuleUrl as Url } from './common';
import { ModuleProps, ModuleView as View } from './Module.View';

export { ModuleProps };

/**
 * Export
 */
type Fields = {
  LoadMask: typeof LoadMask;
  DEFAULT: typeof DEFAULT;
  App: typeof App;
  Url: typeof Url;
};

export const Module = FC.decorate<ModuleProps, Fields>(
  View,
  { DEFAULT, LoadMask, App, Url },
  { displayName: 'Module' },
);
