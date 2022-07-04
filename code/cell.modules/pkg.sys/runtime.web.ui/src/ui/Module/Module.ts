import { ModuleApp } from '../Module.App';
import { DEFAULT, FC, LoadMask } from './common';
import { ModuleProps, ModuleView as View } from './Module.View';
import { ModuleUrl } from '../Module.Url';

export { ModuleProps };

/**
 * Export
 */
type Fields = {
  LoadMask: typeof LoadMask;
  DEFAULT: typeof DEFAULT;
  App: typeof ModuleApp;
  Url: typeof ModuleUrl;
};

export const Module = FC.decorate<ModuleProps, Fields>(
  View,
  { DEFAULT, LoadMask, App: ModuleApp, Url: ModuleUrl },
  { displayName: 'Module' },
);
