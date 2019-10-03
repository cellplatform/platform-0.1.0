import { refs } from '.';
import { expect, testContext } from './TEST';
import * as util from './util';

describe('refs.util', () => {
  it('isFormula', () => {
    const test = (value: any, expected: boolean) => {
      expect(util.isFormula(value)).to.eql(expected);
    };
    test(undefined, false);
    test('', false);
    test(' =', false);
    test({}, false);
    test(123, false);

    test('=', true);
    test('=SUM(1,2,3)', true);
  });

  describe('sort', () => {
    it('no refs', async () => {
      const ctx = testContext({
        A1: { value: 123 },
        A2: { value: 456 },
        C3: { value: 789 },
      });
      const table = refs.table({ ...ctx });
      const sorted = util.sort({ refs: await table.refs() });

      expect(sorted.ok).to.eql(true);
      expect(sorted.errors).to.eql([]);
      expect(sorted.keys).to.eql([]);
    });

    it('simple', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(A2,C3,Z9)' },
        A2: { value: 123 },
        C3: { value: '=A2' },
      });
      const table = refs.table({ ...ctx });
      const sorted = util.sort({ refs: await table.refs() });

      expect(sorted.ok).to.eql(true);
      expect(sorted.errors).to.eql([]);
      expect(sorted.keys).to.eql(['A2', 'C3', 'Z9', 'A1']);
    });

    it('complex', async () => {
      const ctx = testContext({
        A1: { value: '=A2' },
        A2: { value: '123' },
        A3: { value: '=A4' },
        A4: { value: 'abc' },
        A5: { value: '=A1' }, // => A2 (double hop).
        A6: { value: '=SUM(A5, A1, A4)' },
        A7: { value: '=SUM(A6, 1)' },
      });

      const table = refs.table({ ...ctx });
      const sorted = util.sort({ refs: await table.refs() });

      expect(sorted.ok).to.eql(true);
      expect(sorted.errors).to.eql([]);
      expect(sorted.keys).to.eql(['A2', 'A1', 'A5', 'A4', 'A6', 'A3', 'A7']);
    });

    it('circular-ref error', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(A2,C3,Z9)' },
        A2: { value: '=A1' },
        C3: { value: '=A2' },
      });
      const table = refs.table({ ...ctx });
      const sorted = util.sort({ refs: await table.refs() });

      expect(sorted.ok).to.eql(false);
      expect(sorted.errors.length).to.eql(3);

      expect(sorted.errors.map(err => err.path).sort()).to.eql([
        'A1/A2/A1',
        'A2/A1/A2',
        'C3/A2/A1/A2',
      ]);
      expect(sorted.keys).to.eql(['C3', 'A2', 'Z9', 'A1']);
    });
  });
});
