import { Is, t } from './common';
import { Def } from './TestSuiteModel';

/**
 * Entry point to the unit-testing system.
 */
export const Test: t.Test = {
  describe: Def.variants(),
  async bundle(items) {
    const root = Test.describe('tests');
    const wait = (items ?? []).map(async (item) => {
      const suite = Is.promise(item) ? (await item).default : item;
      return Is.suite(suite) ? (suite as t.TestSuiteModel) : undefined;
    });
    const suites = (await Promise.all(wait)).filter(Boolean) as t.TestSuiteModel[];
    return root.merge(...suites);
  },
};
