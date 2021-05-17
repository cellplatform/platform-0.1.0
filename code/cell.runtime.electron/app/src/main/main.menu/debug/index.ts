import { app, MenuItemConstructorOptions as M } from 'electron';
import { t, fs, log } from '../../common';
import { serverMenu } from './debug.server';
import { dataMenu } from './debug.data';
import { devToolsMenu } from './debug.devTools';
import { modulesMenu } from './debug.modules';

/**
 * Menu for working with debug tools.
 */
export function debugMenu(args: { paths: t.IAppPaths; port: number; isMac: boolean }): M {
  const { paths } = args;
  const item: M = {
    label: 'Debug',
    submenu: [
      modulesMenu(args),
      { type: 'separator' },
      serverMenu(args),
      devToolsMenu(args),
      dataMenu(args),
    ],
  };

  return item;
}
