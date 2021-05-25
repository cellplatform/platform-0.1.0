import { MenuItemConstructorOptions as M } from 'electron';

import { t } from '../../common';

/**
 * Root menu for operating on files.
 */
export function fileMenu(args: { paths: t.IElectronPaths; port: number; isMac: boolean }): M {
  const { paths, isMac } = args;

  const item: M = {
    label: 'File',
    submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
  };
  return item;
}
