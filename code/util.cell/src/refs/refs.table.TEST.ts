import { expect, expectError } from '@platform/test';
import { refs } from '.';
import { t } from '../common';

type Table = t.ICoordTable<{ value: any }>;
const testContext = (cells: Table) => {
  const getValue: t.RefGetValue = async (key: string) => {
    const cell = cells[key];
    const value = cell ? cell.value : undefined;
    return typeof value === 'function' ? value() : value;
  };
  const getKeys: t.RefGetKeys = async () => Object.keys(cells);
  return { getKeys, getValue };
};

describe('refs.table', () => {
  describe('outgoing', () => {
    it('empty', async () => {
      const ctx = testContext({});
      const table = refs.table({ ...ctx });
      const res = await table.outgoing();
      expect(res).to.eql({});
    });

    it('calculate all (default)', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(A2,D5)' },
        A2: { value: '=D5' },
        D5: { value: 456 },
      });
      const table = refs.table({ ...ctx });

      const res = await table.outgoing();
      expect(Object.keys(res)).to.eql(['A2', 'A1']);

      expect(res.A1[0].path).to.eql('A1/A2/D5');
      expect(res.A1[1].path).to.eql('A1/D5');
      expect(res.A2[0].path).to.eql('A2/D5');
    });

    it('calculate subset (range)', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(A2,D5)' },
        A2: { value: 123 },
        D5: { value: '=A2' },
      });
      const table = refs.table({ ...ctx });

      const res1 = await table.outgoing();
      const res2 = await table.outgoing({ range: 'A1:A99' });

      expect(Object.keys(res1)).to.eql(['D5', 'A1']);
      expect(Object.keys(res2)).to.eql(['A1']);
    });

    it('throws on invalid range', async () => {
      const ctx = testContext({});
      const fail = async (range: string) => {
        const table = refs.table({ ...ctx });
        const fn = async () => table.outgoing({ range });
        return expectError(fn);
      };
      await fail('A1');
      await fail('A');
      await fail('1');
      await fail('A1:*');
      await fail('*');
      await fail('*:*');
    });

    describe('caching', () => {
      it('read', async () => {
        const ctx = testContext({
          A1: { value: '=SUM(A2,C3)' },
          A2: { value: 123 },
          C3: { value: '=A2' },
        });
        const table = refs.table({ ...ctx });

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

        // Requery (pulls from cache).
        const res5 = await table.outgoing();
        expect(res5.A1).to.equal(res4.A1);
        expect(res5.A1).to.not.equal(res3.A1);
      });

      it('removed when cell updated', async () => {
        let A1 = '=SUM(A2,C3)';
        const ctx = testContext({
          A1: { value: () => A1 },
          A2: { value: 123 },
          C3: { value: '=A2' },
        });
        const table = refs.table({ ...ctx });

        const res1 = await table.outgoing();
        expect(res1.A1.length).to.eql(2);

        A1 = '=C3';
        const res2 = await table.outgoing({ range: 'A1:A1', force: true });
        expect(res2.A1.length).to.eql(1);
        expect(res2.A1[0].path).to.eql('A1/C3/A2');

        A1 = 'hello';
        const res3 = await table.outgoing({ range: 'A1:A1', force: true });
        expect(res3).to.eql({});
      });

      it('reset (method)', async () => {
        const ctx = testContext({
          A1: { value: '=SUM(A2,C3)' },
          A2: { value: 123 },
          C3: { value: '=A2' },
        });
        const table = refs.table({ ...ctx });

        const res1 = await table.outgoing();
        const res2 = await table.reset().outgoing();

        expect(res1.A1).to.not.equal(res2.A1);
        expect(res1.A1).to.eql(res2.A1);

        expect(res1.C3).to.not.equal(res2.C3);
        expect(res1.C3).to.eql(res2.C3);
      });
    });
  });

  describe('incoming', () => {
    it('empty', async () => {
      const ctx = testContext({});
      const table = refs.table({ ...ctx });
      const res = await table.incoming();
      expect(res).to.eql({});
    });

    it('calculate references', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(A2,C3)' },
        A2: { value: 123 },
        C3: { value: '=A2' },
      });
      const table = refs.table({ ...ctx });
      const res = await table.incoming();

      expect(Object.keys(res)).to.eql(['A2', 'C3']);

      expect(res.A2[0].cell).to.eql('C3');
      expect(res.A2[1].cell).to.eql('A1');
      expect(res.C3[0].cell).to.eql('A1');
    });

    it('cache', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(A2,C3)' },
        A2: { value: 123 },
        C3: { value: '=A2' },
      });

      const table = refs.table({ ...ctx });
      const res1 = await table.incoming();
      const res2 = await table.incoming();
      const res3 = await table.incoming({ force: true });

      expect(res1.A2).to.not.eql(undefined);

      expect(res1.A2).to.equal(res2.A2);
      expect(res2.A2).to.not.equal(res3.A2); // Different instance - forced from cache.

      const res4 = await table.incoming();
      expect(res3.A2).to.equal(res4.A2);

      table.reset();

      const res5 = await table.incoming();
      expect(res4.A2).to.not.equal(res5.A2);
    });
  });
});
