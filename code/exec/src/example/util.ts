/**
 * A more useful, promise based version `setTimeout`.
 */
export async function delay(msecs: number, fn?: () => any) {
  return new Promise(resolve => {
    setTimeout(() => {
      if (fn) {
        fn();
      }
      resolve();
    }, msecs);
  });
}

export const time = { delay };
