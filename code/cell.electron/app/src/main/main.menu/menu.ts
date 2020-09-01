import { app, Menu, MenuItemConstructorOptions as M } from 'electron';
import { debug } from './menu.debug';
import { t } from '../common';

/**
 * Builds the application menus.
 */
export async function build(args: { paths: t.IAppPaths }) {
  const isMac = process.platform === 'darwin';

  /**
   * Based on default template from Electron documentation
   * See:
   *    https://www.electronjs.org/docs/api/menu#main-process
   */

  const template = [
    // { role: 'appMenu' }
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideothers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' },
              { role: 'delete' },
              { role: 'selectAll' },
              { type: 'separator' },
              {
                label: 'Speech',
                submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
              },
            ]
          : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
      ],
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        // { type: 'separator' },
        // { role: 'resetzoom' },
        // { role: 'zoomin' },
        // { role: 'zoomout' },
        // { type: 'separator' },
        // { role: 'togglefullscreen' },
      ],
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
          : [{ role: 'close' }]),
      ],
    },
    debug(args),
    {
      role: 'help',
      submenu: [
        // {
        //   label: 'Learn More',
        //   click: async () => {
        //     const { shell } = require('electron');
        //     await shell.openExternal('https://electronjs.org');
        //   },
        // },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template as M[]);
  Menu.setApplicationMenu(menu);
}
