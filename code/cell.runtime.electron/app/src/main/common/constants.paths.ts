import { app } from 'electron';
import log from 'electron-log';

import { fs } from './libs';
import * as t from './types';

const resolve = (path: string) =>
  app?.isPackaged ? fs.join(app.getAppPath(), path) : fs.resolve(path);

/**
 * File paths.
 */
export const Paths = {
  resolve,

  tmp: {
    base: fs.resolve('../tmp'),
    test: fs.resolve('../tmp.test'),
  },

  data(options: { prod?: boolean; dirname?: string } = {}): t.ElectronDataPaths {
    const { prod = false, dirname = 'A1' } = options;
    const NODE_ENV = process.env.NODE_ENV;

    let dir = '';
    if (prod) dir = fs.join(app.getPath('documents'), dirname);
    if (!prod) dir = NODE_ENV === 'test' ? Paths.tmp.test : Paths.tmp.base;

    return {
      dir,
      db: `${dir}/data/local.db`,
      fs: `${dir}/data/local.fs`,
      config: `${dir}/data/config.json`,
      archive: `${dir}/data.backup`,
      log: log.transports.file.getFile().path,
    };
  },

  preload: resolve('lib/preload.js'),

  get bundle() {
    const base = resolve('lib.bundle');
    return {
      base,
      sys: {
        project: resolve('../../cell.modules/pkg.sys/runtime.electron'),
        source: fs.join(base, 'sys.runtime/web'),
        target: 'sys.runtime/web',
      },
    };
  },

  assets: {
    icons: resolve('assets/icons'),
  },
};
