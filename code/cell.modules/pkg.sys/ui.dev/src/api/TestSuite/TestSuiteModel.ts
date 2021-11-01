import { DEFAULT, Is, slug, t, time } from './common';
import { Constraints } from './helpers/Constraints';
import { TestModel } from './TestModel';

type LazyParent = () => t.TestSuiteModel;

export const Def = {
  describe(modifier?: t.TestModifier, getParent?: LazyParent): t.TestSuiteDescribeDef {
    return (description, handler) => {
      const parent = getParent?.();
      const child = TestSuiteModel({ parent, description, handler, modifier });
      if (parent) parent.state.children = [...parent.state.children, child];
      return child;
    };
  },

  variants(getParent?: LazyParent): t.TestSuiteDescribe {
    const describe = Def.describe(undefined, getParent);
    (describe as any).skip = Def.describe('skip', getParent);
    (describe as any).only = Def.describe('only', getParent);
    return describe as t.TestSuiteDescribe;
  },
};

/**
 * A test suite model.
 */
export const TestSuiteModel = (args: {
  parent?: t.TestSuiteModel;
  description: string;
  handler?: t.TestSuiteHandler;
  modifier?: t.TestModifier;
}): t.TestSuiteModel => {
  const { parent, description } = args;
  const id = `TestSuite.${slug()}`;

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
      const res: R = { id, ok: true, description, elapsed: -1, tests: [], children: [] };
      await init(model);

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
        const excluded = Constraints.exclusionModifiers(test);
        res.tests.push(await test.run({ timeout, excluded }));
      }

      if (deep && state.children.length > 0) {
        for (const child of state.children) {
          const timeout = child.state.timeout ?? getTimeout();
          res.children.push(await child.run({ timeout })); // <== RECURSION 🌳
        }
      }

      done();
    });
  };

  const state: t.TestSuiteModelState = {
    parent,
    ready: false,
    modifier: args.modifier,
    description,
    tests: [],
    children: [],
    handler: args.handler,
  };

  /**
   * Define a child suite.
   */
  const describe = Def.variants(() => model);

  /**
   * Define a single test.
   */
  const testDef = (modifier?: t.TestModifier): t.TestSuiteItDef => {
    return (description, handler) => {
      const parent = model;
      const test = TestModel({ parent, description, handler, modifier });
      state.tests = [...state.tests, test];
      return test;
    };
  };

  const it = testDef();
  (it as any).skip = testDef('skip');
  (it as any).only = testDef('only');

  const model: t.TestSuiteModel = {
    kind: 'TestSuite',
    id,
    state,
    run,
    init: () => init(model),

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

    toString() {
      return state.description;
    },
  };

  return model;
};
