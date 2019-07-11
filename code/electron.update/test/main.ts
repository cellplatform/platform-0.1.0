import uiharness from '@uiharness/electron/lib/main';
import { app, BrowserWindow } from 'electron';
import { exec } from '@platform/exec';

import * as appPath from 'app-root-path';

// import * as path from 'app-root-path';
import { format } from 'url';

import { Bundle, Release } from '../src/main';
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
  try {
    const res = await uiharness.init({ config });
    const log = res.log;
    log.info('main started');

    const p = appPath.resolve('.');
    // console.log('p', p);
    log.info('app root path:', p);

    // const r1 = await exec.cmd.run('npm -v');
    // log.info(r1.info);

    // const TMP = 'cd /Users/phil/Dropbox/TEMP';
    // await exec.cmd.run(`${TMP} && npm init -y`);
    // await exec.cmd.run(`${TMP} && npm i @platform/libs`);
    // await exec.cmd.run

    // const baseDir = fs.resolve('./tmp/releases');
    const baseDir = app.getPath('userData');
    log.info('baseDir', baseDir);
    const baseUrl =
      'https://uih.sfo2.digitaloceanspaces.com/%40platform/electron.loader/releases';

    const store = res.store as t.ILoaderSettings;
    const current = await store.get('LOADER/current');
    console.log('current', current);

    if (current) {
      const release = Release.create({ version: current, baseUrl, baseDir });
      const isDownloaded = await release.isDownloaded();
      console.log('release.dir', release.dir);
      console.log('isDownloaded', isDownloaded);
    }

    const ipc = res.ipc as uiharness.IpcClient<t.ElectronLoaderEvents>;

    ipc.on<t.IOpenWindowEvent>('ELECTRON_LOADER/open').subscribe(async e => {
      console.log('-------------------------------------------');
      const { version, html } = e.payload;
      log.info('version', version);
      log.info('html', html);
      store.set('LOADER/current', version);

      const release = Release.create({ version, baseUrl, baseDir });
      await release.download();

      const file = release.renderer.file('electron.test.renderer.one.html');

      const window = new BrowserWindow({
        width: 700,
        height: 350,
      });

      console.log('load url', file);

      window.loadURL(file);
    });
  } catch (error) {
    console.log('error', error);
  }
})();
