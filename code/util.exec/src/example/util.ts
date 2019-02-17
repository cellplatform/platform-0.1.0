export async function delay(msecs: number, fn?: () => void) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fn) {
        fn();
      }
      resolve();
    }, msecs);
  });
}

export const time = { delay };
