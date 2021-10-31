import { Is, t } from './common';
import { Def } from './TestSuiteModel';

/**
 * Entry point to the unit-testing system.
 */
export const Test: t.Test = {
  describe: Def.variants(),

  /**
   * Bundle together a suite of tests from different ES modules,
   * either statically or dynamically imported.
   */
  async bundle(...args: any[]) {
    type B = t.TestSuiteModel | Promise<any>;

    const param1 = args[0];
    const param2 = args[1];

    const name = typeof param1 === 'string' ? param1 : 'Tests';
    const items = (typeof param1 === 'string' ? param2 : param1) as B[];
    if (!Array.isArray(items))
      throw new Error(`An array of tests, or dynamic imports, not specified`);

    const root = Test.describe(name);
    const wait = items.map(async (item) => {
      const suite = Is.promise(item) ? (await item).default : item;
      return Is.suite(suite) ? (suite as t.TestSuiteModel) : undefined;
    });

    const suites = (await Promise.all(wait)).filter(Boolean) as t.TestSuiteModel[];
    return root.merge(...suites);
  },
};
