import { BrowserWindow } from 'electron';

import { constants, log, Schema } from '../common';

export function createWindow(args: { def: string }) {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: { nodeIntegration: true },
  });

  const NODE_ENV = process.env.NODE_ENV;
  const isDev = NODE_ENV === 'development';

  const urls = Schema.urls(constants.HOST);
  const entryUrl = urls
    .cell(constants.URI.UI_FILES)
    .file.byName('index.html')
    .toString();

  const query = `def=${args.def}`;
  const url = isDev ? 'http://localhost:1234' : entryUrl;

  win.loadURL(`${url}?${query}`);
  win.webContents.openDevTools(); // TEMP 🐷

  // Log state.
  (() => {
    const table = log.table({ border: false });
    const add = (key: string, value: any) => {
      key = `• ${log.green(key)} `;
      table.add([key, value]);
    };
    add('def:', args.def);
    add('url:', entryUrl);
    if (isDev) {
      add('url (dev):', url);
    }
    add('query string:', query);

    const output = `
${log.white('window')}
${table}
    `;

    log.info.gray(output);
  })();
}
