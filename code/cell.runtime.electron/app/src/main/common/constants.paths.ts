import { app } from 'electron';
import { fs } from './libs';
import * as t from './types';

import electronLog from 'electron-log';

const resolve = (path: string) =>
  app?.isPackaged ? fs.join(app.getAppPath(), path) : fs.resolve(path);

/**
 * File paths.
 */
export const paths = {
  resolve,

  data(args: { prod?: boolean; dirname?: string } = {}): t.ElectronDataPaths {
    const { prod = false, dirname = 'A1' } = args;
    const dir = prod ? fs.join(app.getPath('documents'), dirname) : fs.resolve('../.data');
    return {
      dir,
      db: `${dir}/local.db`,
      fs: `${dir}/local.fs`,
      config: `${dir}/.config.json`,
      archive: `${dir}/.archive`,
      log: electronLog.transports.file.getFile().path,
    };
  },

  preload: resolve('lib/preload.js'),
  bundle: {
    base: resolve('lib.bundle'),
    sys: resolve('lib.bundle/app.sys/web'),
  },
  assets: {
    icons: resolve('assets/icons'),
  },
};
