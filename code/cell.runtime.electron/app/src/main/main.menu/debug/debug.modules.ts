import { app, MenuItemConstructorOptions as M, shell, BrowserWindow } from 'electron';
import { constants, t, fs, log, ConfigFile } from '../../common';

/**
 * Menu for installing a new module.
 */
export function modulesMenu(args: { paths: t.IElectronPaths; port: number }): M {
  const { paths } = args;

  const item: M = {
    label: 'Modules',
    submenu: [
      {
        label: 'Install...',
        click: async () => {
          console.log('install');
          // shell.openPath(paths.dir);

          console.log('constants.paths.bundle.preload', constants.paths.bundle.preload);

          // const preload = fs.resolve('./dist/web/preload.js');
          // const path = fs.resolve('.');
          // console.log('path', path);

          // const preload = fs.resolve('../app.sys/dist/preload.js');
          // const preload =
          //   '~/code/@platform/code/cell.runtime.electron/app.sys/dist/preload.js';
          // console.log('preload', preload);

          const argv: string[] = [];

          const browser = new BrowserWindow({
            width: 900,
            height: 600,
            show: false,
            titleBarStyle: 'hiddenInset',
            transparent: true,
            vibrancy: 'selection',
            acceptFirstMouse: true,
            webPreferences: {
              sandbox: false,
              nodeIntegration: false, // NB: Obsolete (see `contextIsolation`) but leaving around for safety.
              contextIsolation: true, // https://www.electronjs.org/docs/tutorial/context-isolation
              enableRemoteModule: false,
              preload: constants.paths.bundle.preload,
              // preload,
              additionalArguments: argv,
            },
          });

          browser.once('ready-to-show', () => {
            // console.log('read to show');
            // browser.setTitle(window.props.title);
            // if (app.props.devTools && ENV.isDev) {
            //   browser.webContents.openDevTools({ mode: 'undocked' });
            // }
            browser.show();
          });

          const url = 'http://localhost:5050';
          browser.loadURL(url);

          const config = await ConfigFile.read();
          console.log('config file', config);
        },
      },
    ],
  };

  return item;
}
