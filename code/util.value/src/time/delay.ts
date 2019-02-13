import { TimeDelay, TimeWait } from './types';

/**
 * Better parameter order for setTimeout returning a promise.
 */
export const delay: TimeDelay = (msecs, callback) => {
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
export const wait: TimeWait = msecs => delay(msecs, () => false);
