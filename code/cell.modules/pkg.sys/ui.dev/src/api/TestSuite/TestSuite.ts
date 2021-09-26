import { t, time, DEFAULT, slug, is, isSuite } from './common';
import { TestModel } from './Test';

/**
 * Suite of tests.
 */
export const Test: t.Test = {
  describe: describeDefVariants(),
  async bundle(items) {
    // const description = typeof param1 === 'string' ? param1 : 'root';
    // const items = Array.isArray(param1) ? param1 : param2;

    const root = Test.describe('tests');
    const wait = (items ?? []).map(async (item) => {
      const suite = is.promise(item) ? (await item).default : item;
      return isSuite(suite) ? (suite as t.TestSuiteModel) : undefined;
    });
    const suites = (await Promise.all(wait)).filter(Boolean) as t.TestSuiteModel[];
    return root.merge(...suites);
  },
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
  const describe = describeDefVariants(state);

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
    id: `TestSuite.${slug()}`,
    state,
    run,

    describe: describe as t.TestSuiteDescribe,
    it: it as t.TestSuiteIt,

    timeout(value) {
      state.timeout = Math.max(0, value);
      return model;
    },

    merge(...suites) {
      const children = [...state.children];
      (suites ?? []).forEach((suite) => {
        const exists = children.some((child) => child.id === suite.id);
        if (!exists) children.push(suite);
      });
      state.children = children;
      return model;
    },
  };

  return model;
};

/**
 * [Helpers]
 */

function describeDef(
  modifier?: t.TestModifier,
  state?: t.TestSuiteModelState,
): t.TestSuiteDescribeDef {
  return (description, handler) => {
    const child = TestSuiteModel({ description, handler, modifier });
    if (state) state.children = [...state.children, child];
    return child;
  };
}

function describeDefVariants(state?: t.TestSuiteModelState): t.TestSuiteDescribe {
  const describe = describeDef(undefined, state);
  (describe as any).skip = describeDef('skip', state);
  (describe as any).only = describeDef('only', state);
  return describe as t.TestSuiteDescribe;
}
