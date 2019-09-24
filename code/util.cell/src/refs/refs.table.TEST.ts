import { expect } from 'chai';
import { refs } from '.';
import { t } from '../common';

type Table = t.ICoordTable<{ value: any }>;
const testContext = (cells: Table) => {
  return async (key: string) => {
    const cell = cells[key];
    return cell ? cell.value : undefined;
  };
};

describe('refs.table', () => {
  describe('constructor', () => {
    it('constructs', () => {
      const getValue = testContext({});
      const table = refs.table({ range: 'A1:D10', getValue });
    });

    it('throws on invalid range', () => {
      const getValue = testContext({});
      const fail = (range: string) => {
        const fn = () => refs.table({ range, getValue });
        expect(fn).to.throw(/must be a valid cell range/);
      };
      fail('A1');
      fail('A');
      fail('1');
      fail('A1:*');
      fail('*');
      fail('*:*');
    });
  });

  describe('outgoing', () => {
    it('empty', async () => {
      const getValue = testContext({});
      const table = refs.table({ range: 'A1:B3', getValue });
      const res = await table.outgoing();
      expect(res).to.eql({});
    });

    it('calculate all (default)', async () => {
      const getValue = testContext({
        A1: { value: '=SUM(A2,D5)' },
        A2: { value: '=D5' },
        D5: { value: 456 },
      });
      const table = refs.table({ range: 'A1:D5', getValue });

      const res = await table.outgoing();
      expect(Object.keys(res)).to.eql(['A2', 'A1']);

      expect(res.A1[0].path).to.eql('A1/A2/D5');
      expect(res.A1[1].path).to.eql('A1/D5');
      expect(res.A2[0].path).to.eql('A2/D5');
    });

    it('calculate subset (range)', async () => {
      const getValue = testContext({
        A1: { value: '=SUM(A2,D5)' },
        A2: { value: 123 },
        D5: { value: '=A2' },
      });
      const table = refs.table({ range: 'A1:D9', getValue });

      const res1 = await table.outgoing();
      const res2 = await table.outgoing({ range: 'A1:A9' });

      expect(Object.keys(res1)).to.eql(['D5', 'A1']);
      expect(Object.keys(res2)).to.eql(['A1']);
    });

    it('caching', async () => {
      const getValue = testContext({
        A1: { value: '=SUM(A2,C3)' },
        A2: { value: 123 },
        C3: { value: '=A2' },
      });
      const table = refs.table({ range: 'A1:C3', getValue });

      const res1 = await table.outgoing();
      const res2 = await table.outgoing();

      expect(res1).to.not.equal(res2); //   NB: Different root object.
      expect(res1.A1).to.equal(res2.A1); // NB: Same ref instances (cached)
      expect(res1.C3).to.equal(res2.C3);

      // Force re-calculate.
      const res3 = await table.outgoing({ force: true });
      expect(res3.A1).to.not.equal(res1.A1); // NB: Different ref instances (force reset)
      expect(res3.C3).to.not.equal(res1.C3);

      expect(res1.A1).to.eql(res3.A1); // NB: Equivalent values.
      expect(res1.C3).to.eql(res3.C3);

      // Force re-calculate subset only.
      const res4 = await table.outgoing({ range: 'A1:A1', force: true });
      expect(res4.A1).to.not.equal(res3.A1);
      expect(res4.C3).to.eql(undefined);

      const res5 = await table.outgoing();
      expect(res5.A1).to.equal(res4.A1);
      expect(res5.A1).to.not.equal(res3.A1);
    });

    it('cache reset', async () => {
      const getValue = testContext({
        A1: { value: '=SUM(A2,C3)' },
        A2: { value: 123 },
        C3: { value: '=A2' },
      });
      const table = refs.table({ range: 'A1:C3', getValue });

      const res1 = await table.outgoing();
      const res2 = await table.reset().outgoing();

      expect(res1.A1).to.not.equal(res2.A1);
      expect(res1.A1).to.eql(res2.A1);

      expect(res1.C3).to.not.equal(res2.C3);
      expect(res1.C3).to.eql(res2.C3);
    });
  });
});
