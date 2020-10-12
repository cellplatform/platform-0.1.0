import { app } from 'electron';

/**
 * Environment flags.
 */
export const is = {
  get prod() {
    try {
      return app === undefined ? process.env.NODE_ENV === 'production' : app.isPackaged;
    } catch (err) {
      return false;
    }
  },

  get dev() {
    return !is.prod;
  },

  get mac() {
    return process.platform === 'darwin';
  },

  toObject() {
    return {
      dev: is.dev,
      prod: is.prod,
      mac: is.mac,
    };
  },
};
