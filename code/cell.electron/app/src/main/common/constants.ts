export * from './constants.paths';

export const URI = {
  UI_FILES: 'cell:sys:A1',
};

/**
 * Environment.
 */
export const ENV = {
  get NODE() {
    return process.env.NODE_ENV;
  },
  get DEV() {
    return ENV.NODE === 'development';
  },
  get PROD() {
    return ENV.NODE === 'production';
  },
};
