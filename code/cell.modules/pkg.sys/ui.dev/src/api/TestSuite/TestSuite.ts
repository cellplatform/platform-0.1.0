import { t, time, DEFAULT } from './common';
import { TestModel } from './Test';

/**
 * Suite of tests.
 */
export const Test: t.Test = {
  describe: (description, handler) => TestSuiteModel({ description, handler }),
};

/**
 * A test suite model.
 */
export const TestSuiteModel = (args: {
  description: string;
  handler?: t.TestSuiteHandler;
  modifier?: t.TestModifier;
}): t.TestSuiteModel => {
  const { description } = args;

  const init = async (suite: t.TestSuiteModel) => {
    const state = suite.state;
    if (!state.ready) {
      state.ready = true;
      await state.handler?.(suite);
      await Promise.all(state.children.map((child) => init(child))); // <== RECURSION 🌳
    }
    return suite;
  };

  const run: t.TestSuiteRun = (args = {}) => {
    const { deep = true } = args;

    type R = t.TestSuiteRunResponse;
    return new Promise<R>(async (resolve) => {
      init(model);
      const res: R = { ok: true, description, elapsed: -1, tests: [], children: [] };

      const getTimeout = () => args.timeout ?? state.timeout ?? DEFAULT.TIMEOUT;
      const timer = time.timer();

      const done = () => {
        res.elapsed = timer.elapsed.msec;
        if (res.tests.some(({ error }) => Boolean(error))) res.ok = false;
        if (res.children.some(({ ok }) => !ok)) res.ok = false;
        resolve(res);
      };

      for (const test of state.tests) {
        const timeout = getTimeout();
        res.tests.push(await test.run({ timeout }));
      }

      if (deep && state.children.length > 0) {
        for (const child of state.children) {
          const timeout = child.state.timeout ?? getTimeout();
          res.children.push(await child.run({ timeout }));
        }
      }

      done();
    });
  };

  const state: t.TestSuiteModelState = {
    ready: false,
    modifier: args.modifier,
    description,
    tests: [],
    children: [],
    handler: args.handler,
    init: () => init(model),
  };

  /**
   * Define a child suite.
   */
  const suiteDef = (modifier?: t.TestModifier): t.TestSuiteDescribeDef => {
    return (description, handler) => {
      const child = TestSuiteModel({ description, handler, modifier });
      state.children = [...state.children, child];
      return child;
    };
  };
  const describe = suiteDef();
  (describe as any).skip = suiteDef('skip');
  (describe as any).only = suiteDef('only');

  /**
   * Define a single test.
   */
  const testDef = (modifier?: t.TestModifier): t.TestSuiteItDef => {
    return (description, handler) => {
      const test = TestModel({ description, handler, modifier });
      state.tests = [...state.tests, test];
      return test;
    };
  };

  const it = testDef();
  (it as any).skip = testDef('skip');
  (it as any).only = testDef('only');

  const model: t.TestSuiteModel = {
    state,
    run,

    describe: describe as t.TestSuiteDescribe,
    it: it as t.TestSuiteIt,

    timeout(value) {
      state.timeout = Math.max(0, value);
      return model;
    },
  };

  return model;
};
