import { app, BrowserWindow } from 'electron';
import { fs, log } from './common';

import { Client } from '@platform/cell.client';
import { startServer } from './server';
import { exec } from '@platform/exec';

/**
 * Initialize
 */

(async () => {
  // app.allowRendererProcessReuse = true; // https://github.com/electron/electron/issues/18397

  const f = await startServer();


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
    // const f = startServer();
    // await f.
    // const client = Client.create('https://dev.db.team/');
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
