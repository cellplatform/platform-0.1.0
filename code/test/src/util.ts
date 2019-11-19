import { exec } from 'child_process';
import { expect } from './libs';

/**
 * Checks for an error within an async function.
 * Example:
 *    Return the result of this function to the test-runner (mocha).
 *
 *        it('should throw', () =>
 *            expectError(async () => {
 *              ! ...code that throws here...
 *          }, 'my error message'));
 *
 */
export async function expectError(fn: () => Promise<any>, message?: string) {
  try {
    await fn();
  } catch (error) {
    if (message) {
      return expect(error.message || '').to.contain(message);
    } else {
      return error;
    }
  }
  const msg = message
    ? `Should fail with error message '${message || ''}'`
    : 'Should fail with error';
  return expect(undefined).to.be.a('Error', msg);
}

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

/**
 * Kills the TCP given port.
 */
export function kill(port: number) {
  return new Promise((resolve, reject) => {
    const cmd = `lsof -t -i tcp:${port} | xargs kill`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
