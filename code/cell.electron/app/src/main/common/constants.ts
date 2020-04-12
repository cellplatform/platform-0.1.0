export * from './constants.paths';

export const URI = {
  UI_FILES: 'cell:sys:A1',
};

/**
 * Environment.
 */
export const ENV = {
  get node() {
    return process.env.NODE_ENV;
  },
  get isDev() {
    return ENV.node === 'development';
  },
  get isProd() {
    return ENV.node === 'production';
  },
};
