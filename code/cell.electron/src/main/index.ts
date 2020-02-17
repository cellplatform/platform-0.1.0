import { app, BrowserWindow } from 'electron';
import { fs, log } from './common';

import { Client } from '@platform/cell.client';
import * as server from './server';
import * as tray from './tray';

let appTray: any;

/**
 * Initialize
 */

(async () => {
  // app.allowRendererProcessReuse = true; // https://github.com/electron/electron/issues/18397

  const f = await server.start();

  // exec.process.spawn('')

  await app.whenReady();
  createWindow();

  log.info('started');

  const table = log.table();

  table.add(['foo', 123]);

  log.info(`\n${table}`);

  // log.info()
  // log.info(logger);

  try {
    appTray = tray.init();
    // const f = startServer();
    // await f.
    const client = Client.create('localhost:8080');
    const res = await client.cell('cell:foo!A1').info();
    log.info(res);
    // const res = await client.cell('cell:ck5n7xoka0000p5et9suq5ygv!A1').files.list();
    // log.info('res', res);
  } catch (error) {
    // console.log('error', error);
    log.error(error);
    // logger.info('foo')
  }
})();

/**
 * Internal
 */
function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      // allow
    },
  });

  // and load the index.html of the app.
  const path = '../../demo/index.html';
  win.loadFile(path);
  win.webContents.openDevTools();
}
