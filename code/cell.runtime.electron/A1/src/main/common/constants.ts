import { app } from 'electron';

export * from '../../renderer.preload/constants';
export * from './constants.paths';

type Pkg = { name: string; version: string };
const pkg = require('../../../package.json') as Pkg; // eslint-disable-line

/**
 * Environment.
 */
export const ENV = {
  pkg,

  get node() {
    return process.env.NODE_ENV;
  },
  get isPackaged() {
    return app ? app.isPackaged : false;
  },
  get isDev() {
    return ENV.isPackaged ? false : ENV.node !== 'production';
  },
  get isProd() {
    return ENV.isPackaged ? true : ENV.node === 'production';
  },
  get isMac() {
    return process.platform === 'darwin';
  },
};
