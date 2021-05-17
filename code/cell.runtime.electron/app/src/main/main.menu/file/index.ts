import { app, MenuItemConstructorOptions as M } from 'electron';
import { t, fs, log } from '../../common';
// import { serverMenu } from './debug.server';
// import { dataMenu } from './debug.data';
// import { devToolsMenu } from './debug.devTools';

/**
 * Root menu for operating on files.
 */
export function fileMenu(args: { paths: t.IAppPaths; port: number; isMac: boolean }): M {
  const { paths, isMac } = args;

  const item: M = {
    label: 'File',
    submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
  };
  return item;
}
