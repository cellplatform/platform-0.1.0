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

  tmp: fs.resolve('../tmp'),

  data(options: { prod?: boolean; dirname?: string } = {}): t.ElectronDataPaths {
    const { prod = false, dirname = 'A1' } = options;

    let dir = '';
    if (prod) dir = fs.join(app.getPath('documents'), dirname);
    if (!prod) dir = Paths.tmp;

    return {
      dir,
      db: `${dir}/data/main.db`,
      dbfs: `${dir}/data/main.db.fs`,
      files: `${dir}/data/files`,
      config: `${dir}/data/config.json`,
      archive: `${dir}/data.backup`,
      log: log.transports.file.getFile().path,
    };
  },

  preload: resolve('lib/preload.js'),

  get bundle() {
    const base = resolve('lib.bundle');
    const source = fs.join(base, 'sys.runtime/web');
    return {
      base,
      sys: {
        project: resolve('../../cell.modules/pkg.sys/runtime.electron'),
        source: { dir: source, manifest: fs.join(source, 'index.json') },
        target: 'sys.runtime/web',
      },
    };
  },

  assets: {
    icons: resolve('assets/icons'),
  },
};
