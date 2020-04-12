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

  const urls = Schema.urls(host);
  const entryUrl = urls
    .cell(constants.URI.UI_FILES)
    .file.byName('env.html')
    .toString();

  const devUrl = constants.ENV.DEV ? 'http://localhost:1234' : '';
  const url = devUrl || entryUrl;

  const query: t.IEnvLoaderQuery = { host, def };
  const querystring = Object.keys(query)
    .reduce((acc, key) => `${acc}&${key}=${query[key]}`, '')
    .replace(/^\&/, '');

  // Construct window.
  win.loadURL(`${url}?${querystring}`);
  win.webContents.openDevTools(); // TEMP 🐷

  // Finish up.
  logWindow({ def, querystring, entryUrl, devUrl });
}

/**
 * [Helpers]
 */

function logWindow(args: { def: string; querystring: string; entryUrl: string; devUrl?: string }) {
  const table = log.table({ border: false });
  const add = (key: string, value: any) => table.add([` • ${log.green(key)} `, value]);

  add('def:', args.def);
  add('url:', args.entryUrl);
  if (args.devUrl) {
    add(log.gray(`url (dev):`), log.white(args.devUrl));
  }
  add('query:', args.querystring);

  const output = `
${log.white('window')}
${table}
  `;
  log.info.gray(output);
}
