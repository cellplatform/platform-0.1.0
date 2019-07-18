export { expect } from 'chai';
export { fs } from '@platform/fs';

/**
 * Better parameter order for setTimeout returning a promise.
 */
export const delay = (msecs: number, callback: () => any) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (callback) {
          callback();
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    }, msecs);
  });
};

/**
 * Pause for the given number of milliseconds with a promise.
 */
export const wait = (msecs: number) => delay(msecs, () => false);
