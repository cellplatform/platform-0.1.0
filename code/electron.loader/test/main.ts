import uiharness from '@uiharness/electron/lib/main';
import { app, BrowserWindow } from 'electron';

// import * as path from 'app-root-path';
import { format } from 'url';

import { Bundle } from '../src/main';
import { t, log } from './common';
import { fs } from '@platform/fs';

const config = require('../.uiharness/config.json') as uiharness.IRuntimeConfig;

export async function start(args: any) {
  args.log.info('👨‍🚀 start from another module!!!');
}

export default start;

/**
 * Initialize the default [main] window process with the [UIHarness].
 *
 * NOTE:
 *  To do your own thing, simply disregard this and write your own.
 *
 *  To get started writing your own [main] entry-point:
 *    https://electronjs.org/docs/tutorial/first-app#electron-development-in-a-nutshell
 *
 *  To review the [UIHarness] entry-point as a example:
 *    https://github.com/uiharness/uiharness/blob/master/code/libs/ELECTRON_LOADER/src/main/index.ts
 *
 */
(async () => {
  const res = await uiharness.init({ config });
  const log = res.log;
  log.info('main started');

  const ipc = res.ipc as uiharness.IpcClient<t.ElectronLoaderEvents>;

  // const path = fs.resolve('./tmp/bundle/0.0.2/main/main.js');
  const path = '/Users/phil/code/@platform/code/electron.loader/tmp/bundle/0.0.2/main/main.js';
  console.log('path', path);

  log.info('open module at path: ', path);

  try {
    const f = require(path);
    f.start({ log });
  } catch (error) {
    console.log('error', error);
  }

  // res.windows.

  // ipc.on<t.IDownloadEvent>('ELECTRON_LOADER/download').subscribe(async e => {
  //   const { version } = e.payload;
  //   const base =
  //     'https://uiharness.sfo2.digitaloceanspaces.com/%40platform/electron.loader/releases';
  //   const url = `${base}/${version}/${version}.zip`;

  //   try {
  //     // const hash = '33265773d8877d9fd28ab9a888fd86a1';
  //     const res = await await Bundle.download({ url, dir: './tmp/releases' });
  //     log.info('download:\n', res);
  //   } catch (error) {
  //     log.info('DOWNLOAD ERROR:', error.message);
  //   }
  // });

  ipc.on<t.IOpenWindowEvent>('ELECTRON_LOADER/open').subscribe(async e => {
    const { version, html } = e.payload;
    log.info('version', version);
    log.info('html', html);

    const dir = fs.resolve('./tmp/releases');
    // const entry = fs.join(dir, version, 'renderer', html);
    const entry =
      '/Users/phil/code/@platform/code/electron.loader/tmp/releases/0.0.2/renderer/electron.test.renderer.one.html';
    console.log('entry', entry);

    const prod = format({
      protocol: 'file:',
      // pathname: path.resolve(entry.path),
      pathname: entry,
      slashes: true,
    });
    console.log('prod', prod);

    const window = new BrowserWindow({
      width: 500,
      height: 300,
    });

    window.loadURL(prod);
  });
})();
