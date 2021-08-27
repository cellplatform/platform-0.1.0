import { exec } from 'child_process';

/**
 * Better parameter order for setTimeout returning a promise.
 */
export const delay = (msecs: number, callback: () => any) => {
  return new Promise<void>((resolve, reject) => {
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

/**
 * Kills the TCP given port.
 */
export function kill(port: number) {
  return new Promise<void>((resolve, reject) => {
    const cmd = `lsof -t -i tcp:${port} | xargs kill`;
    exec(cmd, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
