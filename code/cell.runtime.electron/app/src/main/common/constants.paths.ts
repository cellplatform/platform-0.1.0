import { app } from 'electron';
import { fs } from './libs';
import * as t from './types';

import electronLog from 'electron-log';

const resolve = (path: string) =>
  app?.isPackaged ? fs.join(app.getAppPath(), path) : fs.resolve(path);

/**
 * File paths.
 */
export const Paths = {
  resolve,

  data(args: { prod?: boolean; dirname?: string } = {}): t.ElectronDataPaths {
    const { prod = false, dirname = 'A1' } = args;
    const dir = prod ? fs.join(app.getPath('documents'), dirname) : fs.resolve('../.data');
    return {
      dir,
      db: `${dir}/data/local.db`,
      fs: `${dir}/data/local.fs`,
      config: `${dir}/data/config.json`,
      archive: `${dir}/data.backup`,
      log: electronLog.transports.file.getFile().path,
    };
  },

  preload: resolve('lib/preload.js'),

  get bundle() {
    const base = resolve('lib.bundle');
    return {
      base,
      sys: {
        source: resolve(fs.join(base, 'sys.runtime/web')),
        target: 'sys.runtime/web',
      },
    };
  },

  assets: {
    icons: resolve('assets/icons'),
  },
};
