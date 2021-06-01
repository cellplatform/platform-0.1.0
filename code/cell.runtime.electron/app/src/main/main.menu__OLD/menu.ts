import { app, Menu, MenuItemConstructorOptions as M } from 'electron';
import { debugMenu } from './debug';
import { fileMenu } from './file';
import { t } from '../common';

/**
 * Builds the application menus.
 */
export async function build(args: {
  bus: t.ElectronMainBus;
  paths: t.ElectronDataPaths;
  port: number;
}) {
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
              { role: 'about', label: 'About' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide', label: 'Hide' },
              { role: 'hideothers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit', label: 'Quit' },
            ],
          },
        ]
      : []),
    // { role: 'fileMenu' }
    fileMenu({ ...args, isMac }),
    // {
    //   label: 'File',
    //   submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
    // },
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
    // {
    //   label: 'View',
    //   submenu: [
    //     { role: 'reload' },
    //     { role: 'forcereload' },
    //     { role: 'toggledevtools' },
    //     // { type: 'separator' },
    //     // { role: 'resetzoom' },
    //     // { role: 'zoomin' },
    //     // { role: 'zoomout' },
    //     // { type: 'separator' },
    //     // { role: 'togglefullscreen' },
    //   ],
    // },
    // { role: 'windowMenu' }
    debugMenu({ ...args, isMac }),
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
