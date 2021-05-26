import { app, MenuItemConstructorOptions as M, shell, BrowserWindow } from 'electron';
import { constants, t, fs, log, ConfigFile } from '../../common';
import { Window } from '../../main.Window';

/**
 * Menu for installing a new module.
 */
export function modulesMenu(args: {
  bus: t.EventBus<t.ElectronEvent>;
  paths: t.IElectronPaths;
  port: number;
}): M {
  const { paths, bus } = args;

  const events = Window.Events({ bus });

  const item: M = {
    label: 'Modules',
    submenu: [
      {
        label: 'tmp.status',
        click: async () => {
          const res = await events.status.get();
          console.log('status', res);
        },
      },

      {
        label: 'Install...',
        click: async () => {
          console.log('install');

          const url = 'http://localhost:5050'; // app.sys (localhost)

          const res = await events.create.fire({
            url,
            props: { width: 1200, height: 900 },
            showOnLoad: true,
            devTools: true,
          });

          console.log('create/res:', res);

          console.log('-------------------------------------------');
          const config = await ConfigFile.read();
          console.log('config file', config);
        },
      },
    ],
  };

  return item;
}
