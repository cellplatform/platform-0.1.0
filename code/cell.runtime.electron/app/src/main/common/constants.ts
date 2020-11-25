import { app } from 'electron';

export * from '../../common/constants';
export * from './constants.paths';

/**
 * Environment.
 */
export const ENV = {
  get node() {
    return process.env.NODE_ENV;
  },
  get isPackaged() {
    return app ? app.isPackaged : false;
  },
  get isDev() {
    return ENV.isPackaged ? false : ENV.node === 'development';
  },
  get isProd() {
    return ENV.isPackaged ? true : ENV.node === 'production';
  },
};
