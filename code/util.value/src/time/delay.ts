import * as t from './types';

/**
 * A more useful (promise based) timeout function.
 */
export function delay<T = any>(msecs: number, callback?: () => T): t.TimeDelayPromise<T> {
  let timeout: NodeJS.Timeout | undefined;

  let resolver: any;
  const done = (result?: T) => {
    promise.result = result;
    if (resolver) {
      resolver(result);
    }
  };

  // Start the timeout within a promise.
  const promise: any = new Promise((resolve, reject) => {
    resolver = resolve;
    timeout = setTimeout(() => {
      try {
        if (callback) {
          done(callback());
        } else {
          done();
        }
      } catch (error) {
        reject(error);
      }
    }, msecs);
  });

  // Add extended API to the promise.
  promise.id = timeout;
  promise.isCancelled = false;
  promise.result = undefined;
  promise.cancel = () => {
    if (!promise.isCancelled) {
      promise.isCancelled = true;
      if (timeout) {
        clearTimeout(timeout);
      }
      done();
    }
  };

  // Finish up.
  return promise as t.TimeDelayPromise;
}

/**
 * Pause for the given number of milliseconds with a promise.
 */
export const wait: t.TimeWait = msecs => delay(msecs, () => false);
