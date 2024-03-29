import { DEFAULT, deleteUndefined, is, slug, t, time, R } from './common';

/**
 * A single test.
 */
export const TestModel = (args: {
  parent: t.TestSuiteModel;
  description: string;
  handler?: t.TestHandler;
  modifier?: t.TestModifier;
}): t.TestModel => {
  const { parent, description, handler, modifier } = args;
  const id = `Test.${slug()}`;

  const run: t.TestRun = (options = {}) => {
    type R = t.TestRunResponse;

    return new Promise<R>(async (resolve) => {
      const timer = time.timer();
      const excluded = toExcluded({ modifier, excluded: options.excluded });

      const response: R = {
        id,
        ok: true,
        description,
        elapsed: -1,
        timeout: Math.max(0, options.timeout ?? DEFAULT.TIMEOUT),
        excluded,
      };

      const done = (options: { error?: Error } = {}) => {
        stopTimeout?.();
        response.elapsed = timer.elapsed.msec;
        response.error = options.error;
        response.ok = !Boolean(response.error);
        resolve(deleteUndefined(response));
      };
      if (!handler || excluded) return done();

      let stopTimeout: undefined | (() => void);
      const startTimeout = (msecs: number) => {
        stopTimeout?.();
        const res = time.delay(msecs, () => {
          const error = new Error(`Test timed out after ${msecs} msecs`);
          return done({ error });
        });
        stopTimeout = res.cancel;
      };

      const args: t.TestHandlerArgs = {
        ctx: options.ctx,
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

  const model: t.TestModel = {
    parent,
    kind: 'Test',
    id,
    description,
    modifier,
    handler,
    run,
    toString: () => description,
    clone: () => TestModel(args),
  };
  return model;
};

/**
 * Helpers
 */

const toExcluded = (options: {
  modifier?: t.TestModifier;
  excluded?: t.TestModifier[];
}): t.TestModifier[] | undefined => {
  if (options.modifier === 'skip' || Array.isArray(options.excluded)) {
    let list: t.TestModifier[] = [];
    if (options.modifier === 'skip') list.push('skip');
    if (Array.isArray(options.excluded)) list.push(...options.excluded);
    list = R.uniq(list);
    return list.length === 0 ? undefined : list;
  } else {
    return undefined;
  }
};
