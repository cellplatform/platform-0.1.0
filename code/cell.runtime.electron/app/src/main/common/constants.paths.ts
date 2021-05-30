import { app } from 'electron';
import { fs } from './libs';
import * as t from './types';

const resolve = (path: string) =>
  app?.isPackaged ? fs.join(app.getAppPath(), path) : fs.resolve(path);

/**
 * File paths.
 */
export const paths = {
  resolve,

  data(args: { prod?: boolean; dirname?: string } = {}): t.IElectronPaths {
    const { prod = false, dirname = 'A1' } = args;
    const dir = prod ? fs.join(app.getPath('documents'), dirname) : fs.resolve('../.data');
    return {
      dir,
      db: `${dir}/local.db`,
      fs: `${dir}/local.fs`,
      config: `${dir}/.config.json`,
      archive: `${dir}/.archive`,
    };
  },

  assets: {
    icons: resolve('assets/icons'),
  },

  preload: resolve('lib/preload.js'),
};
