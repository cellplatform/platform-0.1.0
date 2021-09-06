import { t, time, DEFAULT, is, deleteUndefined } from './common';

/**
 * A single test.
 */
export const TestModel = (args: {
  description: string;
  handler?: t.TestHandler;
  modifier?: t.TestModifier;
}): t.TestModel => {
  const { description, handler, modifier } = args;

  const run: t.TestRun = (options = {}) => {
    type R = t.TestRunResponse;

    return new Promise<R>(async (resolve, reject) => {
      const timer = time.timer();
      const response: R = {
        ok: true,
        description,
        elapsed: -1,
        timeout: Math.max(0, options.timeout ?? DEFAULT.TIMEOUT),
        skipped: Boolean(modifier === 'skip' || options.skip) ? true : undefined,
      };

      const done = (options: { error?: Error } = {}) => {
        stopTimeout?.();
        response.elapsed = timer.elapsed.msec;
        response.error = options.error;
        response.ok = !Boolean(response.error);
        resolve(deleteUndefined(response));
      };
      if (!handler || response.skipped) return done();

      let stopTimeout: undefined | (() => void);
      const startTimeout = (msecs: number) => {
        stopTimeout?.();
        const res = time.delay(msecs, () => {
          const error = new Error(`Timed out after ${msecs} msecs`);
          return done({ error });
        });
        stopTimeout = res.cancel;
      };

      const args: t.TestHandlerArgs = {
        timeout(value) {
          response.timeout = Math.max(0, value);
          startTimeout(response.timeout);
          return args;
        },
      };

      try {
        startTimeout(response.timeout);
        const wait = handler(args);
        if (is.promise(wait)) await wait;
        return done();
      } catch (error: any) {
        done({ error });
      }
    });
  };

  const model: t.TestModel = { description, modifier, handler, run };
  return model;
};
