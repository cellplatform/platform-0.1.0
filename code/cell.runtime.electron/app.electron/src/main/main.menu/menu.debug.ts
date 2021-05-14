import { app, MenuItemConstructorOptions as M, shell } from 'electron';
import { t, fs, log } from '../common';
import { serverMenu } from './menu.debug.server';
import { dataMenu } from './menu.debug.data';
import { devToolsMenu } from './menu.debug.devTools';

/**
 * Menu for working with debug tools.
 */
export function debugMenu(args: { paths: t.IAppPaths; port: number }): M {
  const { paths } = args;
  const item: M = {
    label: 'Debug',
    submenu: [serverMenu(args), devToolsMenu(args), dataMenu(args)],
  };

  return item;
}
