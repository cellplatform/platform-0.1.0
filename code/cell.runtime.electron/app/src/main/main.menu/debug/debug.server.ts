import { app, MenuItemConstructorOptions as M, shell } from 'electron';
import { t, fs, log } from '../../common';

/**
 * Menu for opening tools around the locally running HTTP server.
 */
export function serverMenu(args: {
  bus: t.ElectronRuntimeBus;
  paths: t.IElectronPaths;
  port: number;
}): M {
  const { paths } = args;
  const base = `http://localhost:${args.port}`;

  const openBrowser = (path: string) => {
    shell.openExternal(`${base}/${path.replace(/^\//, '')}`);
  };

  const item: M = {
    label: 'Local',
    submenu: [
      {
        label: 'HTTP Endpoint',
        submenu: [{ label: 'main', click: () => openBrowser('/') }],
      },
      {
        label: 'Logs',
        click: () => shell.openPath(log.file.path),
      },
    ],
  };

  return item;
}
