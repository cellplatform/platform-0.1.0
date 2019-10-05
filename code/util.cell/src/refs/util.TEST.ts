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

    it('complex (1)', async () => {
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

    it('complex (2)', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(A2,A3)' },
        A2: { value: '=C1' },
        A3: { value: '=A2 + 2' },
        C1: { value: 5 },
        Z9: { value: 'hello' }, // NB: Not involved.
      });
      const table = refs.table({ ...ctx });
      const sorted = util.sort({ refs: await table.refs() });
      expect(sorted.keys).to.eql(['C1', 'A2', 'A3', 'A1']);
    });

    it('complex (subset)', async () => {
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
      const base = util.sort({ refs: await table.refs() });
      const subset = util.sort({ refs: await table.refs(), keys: ['A1'] });

      expect(base.keys).to.not.eql(subset.keys);
      expect(subset.keys).to.eql(['A1', 'A5', 'A6']);
    });

    it('error: circular-ref', async () => {
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

  describe('path', () => {
    it('path field', () => {
      expect(util.path('A1/A2').path).to.eql('A1/A2');
    });

    it('first/last', () => {
      const test = (input: string | undefined, first: string, last: string) => {
        const path = util.path(input);
        expect(path.first).to.eql(first);
        expect(path.last).to.eql(last);
      };
      test('A1', 'A1', 'A1');
      test('A1/A2', 'A1', 'A2');
      test('A1/A2/A3', 'A1', 'A3');

      test(undefined, '', '');
      test('', '', '');
      test('/', '', '');
    });

    it('parts', () => {
      const test = (input: string | undefined, parts: string[]) => {
        const path = util.path(input);
        expect(path.parts).to.eql(parts);
      };
      test('', []);
      test(undefined, []);
      test('A1', ['A1']);
      test('A1/A2', ['A1', 'A2']);
      test('A1/A2/A3', ['A1', 'A2', 'A3']);
      test('A1/B1:Z9', ['A1', 'B1:Z9']);
    });

    it('keys', () => {
      const test = (input: string | undefined, keys: string[]) => {
        const path = util.path(input);
        expect(path.keys).to.eql(keys);
      };
      test('', []);
      test(undefined, []);
      test('A1', ['A1']);
      test('A1/A2', ['A1', 'A2']);
      test('A1/A2/A3', ['A1', 'A2', 'A3']);

      test('A1:A3', ['A1', 'A2', 'A3']);
      test('A1/A2/A3/A1:A3', ['A1', 'A2', 'A3']); // NB: De-duped.
      test('A1/A1:A3/A3/A1:A3', ['A1', 'A2', 'A3']); // NB: De-duped.
    });

    it('isCircular', () => {
      const test = (input: string | undefined, key: string | string[], isCircular: boolean) => {
        const path = util.path(input);
        expect(path.isCircular(key)).to.eql(isCircular);
      };

      test(undefined, [], false);
      test(undefined, '', false);
      test('', [], false);
      test('', '', false);
      test('A1', 'B1', false);
      test('A1/B1:C5', 'B6', false);
      test('A1/B1:C5', 'C6', false);

      test('A1', 'A1', true);
      test('A1/B1', 'B1', true);
      test('A1/C1/B1', 'B1', true);
      test('A1/B1/C1', 'B1', true);

      test('A1/B1:C5', 'A1', true);
      test('A1/B1:C5', 'B1', true);
      test('A1/B1:C5', 'B5', true);
      test('A1/B1:C5', 'C5', true);
      test('A1/B1:C5/Z9', 'Z9', true);
    });
  });
});
