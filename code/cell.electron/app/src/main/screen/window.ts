import { BrowserWindow } from 'electron';
import { constants, log, Schema, t } from '../common';

export function createWindow(args: { host: string; def: string }) {
  const { host, def } = args;

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
    .file.byName('env.html')
    .toString();

  const url = isDev ? 'http://localhost:1234' : entryUrl;

  const query: t.IEnvLoaderQuery = { host, def };
  const querystring = Object.keys(query)
    .reduce((acc, key) => `${acc}&${key}=${query[key]}`, '')
    .replace(/^\&/, '');

  win.loadURL(`${url}?${querystring}`);
  win.webContents.openDevTools(); // TEMP 🐷

  // Log state.
  (() => {
    const table = log.table({ border: false });
    const add = (key: string, value: any) => table.add([` • ${log.green(key)} `, value]);
    add('def:', args.def);
    add('url:', entryUrl);
    if (isDev) {
      add(log.gray(`url (dev):`), log.white(url));
    }
    add('query:', querystring);

    const output = `
${log.white('window')}
${table}
    `;
    log.info.gray(output);
  })();
}
