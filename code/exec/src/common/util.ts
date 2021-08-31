/**
 * Defines props for the given object.
 */
export function definedPropsFor<T>(obj: Partial<T>) {
  return <K extends keyof T>(name: K, get: () => T[K]) => Object.defineProperty(obj, name, { get });
}

/**
 * Better parameter order for setTimeout returning a promise.
 */
export const delay = (msecs: number, callback?: () => any) => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      try {
        if (callback) {
          callback();
        }
        resolve();
      } catch (error: any) {
        reject(error);
      }
    }, msecs);
  });
};
