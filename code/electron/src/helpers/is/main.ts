import { app } from 'electron';

/**
 * Environment flags.
 */
export const is = {
  get prod() {
    return app.isPackaged;
  },
  get dev() {
    return !app.isPackaged;
  },
};
