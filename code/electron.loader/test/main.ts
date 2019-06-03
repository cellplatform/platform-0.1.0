import { t } from './common';
import { download } from '@platform/http/lib/download';
import { fs } from '@platform/fs';
import { Bundle } from '../src/main';

import uiharness from '@uiharness/electron/lib/main';
const config = require('../.uiharness/config.json') as uiharness.IRuntimeConfig;

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
 *    https://github.com/uiharness/uiharness/blob/master/code/libs/electron/src/main/index.ts
 *
 */
(async () => {
  const res = await uiharness.init({ config });
  const log = res.log;
  log.info('main started');

  const ipc = res.ipc as uiharness.IpcClient<t.ElectronLoaderEvents>;

  ipc.on<t.IBundleEvent>('ELECTRON/bundle').subscribe(async e => {
    const { source, target } = e.payload;
    // const url = 'https://uiharness.sfo2.digitaloceanspaces.com/%40platform/http/images.zip';
    // console.log('download', e);

    await Bundle.zip({ source, target });

    // const zip =

    // const path = fs.resolve('./tmp/images.zip');
    // const b = bundle({path:''})

    // const res = await download(url).save(path);
    // console.log('res', res);

    // const to = fs.resolve('./tmp/images');
    // console.log('to', to);
    // const r = await fs.unzip(path, to);
    // console.log('r', r);
  });

  ipc.on<t.IDownloadEvent>('ELECTRON/download').subscribe(async e => {
    const url = 'https://uiharness.sfo2.digitaloceanspaces.com/%40platform/http/images.zip';
    console.log('download', e);

    // const zip =

    // const path = fs.resolve('./tmp/images.zip');
    // const b = bundle({path:''})

    // const res = await download(url).save(path);
    // console.log('res', res);

    // const to = fs.resolve('./tmp/images');
    // console.log('to', to);
    // const r = await fs.unzip(path, to);
    // console.log('r', r);
  });

  // ipc.on
})();
