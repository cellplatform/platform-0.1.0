import { expect } from '@platform/test';
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
  describe('refs', () => {
    it('both incoming/outgoing', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(A2,C3,Z9)' },
        A2: { value: 123 },
        C3: { value: '=A2' },
      });
      const table = refs.table({ ...ctx });
      const res = await table.refs();

      expect(Object.keys(res.in)).to.eql(['A2', 'C3', 'Z9']); // NB: "Z9" included even though does not exist in the grid.
      expect(Object.keys(res.out)).to.eql(['C3', 'A1']);
    });
  });

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

    it('calculate subset (range: "A:A")', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(A2,D5)' },
        A2: { value: 123 },
        D5: { value: '=A2' },
      });
      const table = refs.table({ ...ctx });

      const res1 = await table.outgoing();
      const res2 = await table.outgoing({ range: 'A1:A99', force: true });
      const res3 = await table.outgoing({ range: 'A:A', force: true }); // NB: Range input variants.
      const res4 = await table.outgoing({ range: 'A', force: true });

      expect(Object.keys(res1)).to.eql(['D5', 'A1']);
      expect(Object.keys(res2)).to.eql(['A1']);
      expect(Object.keys(res3)).to.eql(['A1']);
      expect(Object.keys(res4)).to.eql(['A1']);

      // Everything.
      expect(res1.A1[0].path).to.eql('A1/A2');
      expect(res1.A1[1].path).to.eql('A1/D5/A2');
      expect(res1.D5[0].path).to.eql('D5/A2');

      // Subset range (column "A").
      expect(res2.A1[0].path).to.eql('A1/A2');
      expect(res2.A1[1].path).to.eql('A1/D5/A2');
      expect(res2.D5).to.eql(undefined);
    });

    it('calculate subset (range by key: ["A1", "A2"])', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(A2,D5)' },
        A2: { value: 123 },
        D5: { value: '=A2' },
      });
      const table = refs.table({ ...ctx });

      // Everything.
      const res1 = await table.outgoing();
      expect(Object.keys(res1)).to.eql(['D5', 'A1']);
      expect(res1.A1[0].path).to.eql('A1/A2');
      expect(res1.A1[1].path).to.eql('A1/D5/A2');
      expect(res1.D5[0].path).to.eql('D5/A2');

      // Subset by key.
      const res2 = await table.outgoing({ range: 'A1', force: true });
      const res3 = await table.outgoing({ range: ['A1', 'A2'], force: true });
      expect(res2).to.eql(res3);
      expect(res3.A1[0].path).to.eql('A1/A2');
      expect(res3.A1[1].path).to.eql('A1/D5/A2');
      expect(res3.D5).to.eql(undefined);

      const res4 = await table.outgoing({ range: ['D5'], force: true });
      expect(res4.A1).to.eql(undefined);
      expect(res4.D5[0].path).to.eql('D5/A2');

      // Everything (by key).
      const res5 = await table.outgoing({ range: ['A1', 'A2', 'D5'], force: true });
      expect(res1).to.eql(res5);
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

    it('calculate all', async () => {
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

    it('calculate subset (range: "A:A")', async () => {
      const A1 = '=SUM(A2,C3)';
      const ctx = testContext({
        A1: { value: () => A1 },
        A2: { value: 123 },
        C3: { value: '=A2' },
      });
      const table = refs.table({ ...ctx });

      // Everything.
      const res1 = await table.incoming();
      expect(Object.keys(res1)).to.eql(['A2', 'C3']);
      expect(res1.A2.map(m => m.cell)).to.eql(['C3', 'A1']);
      expect(res1.C3.map(m => m.cell)).to.eql(['A1']);

      // Subset range ("A" column only).
      const res2 = await table.incoming({ range: 'A:A', force: true });
      expect(Object.keys(res2)).to.eql(['A2']);
      expect(res2.A2.map(m => m.cell)).to.eql(['A1']); // NB: Does not contain other "C3" incoming ref.

      // Same range, but declared with single value.
      // NB: Converted to a range internally.
      const res3 = await table.incoming({ range: 'A', force: true });
      expect(Object.keys(res3)).to.eql(['A2']); // NB: Same as above.
      expect(res3.A2.map(m => m.cell)).to.eql(['A1']);
    });

    it('calculate subset (range by key: ["A1", "A2"])', async () => {
      const A1 = '=SUM(A2,C3)';
      const ctx = testContext({
        A1: { value: () => A1 },
        A2: { value: 123 },
        C3: { value: '=A2' },
      });
      const table = refs.table({ ...ctx });

      // Everything.
      const res1 = await table.incoming();
      expect(Object.keys(res1)).to.eql(['A2', 'C3']);
      expect(res1.A2.map(m => m.cell)).to.eql(['C3', 'A1']);
      expect(res1.C3.map(m => m.cell)).to.eql(['A1']);

      // Subset ranges by single keys.
      const res2 = await table.incoming({ range: 'A1', force: true });
      const res3 = await table.incoming({ range: ['A1', 'A2'], force: true });

      expect(res2).to.eql({});
      expect(Object.keys(res3)).to.eql(['A2']);
      expect(res3.A2.map(m => m.cell)).to.eql(['A1']); // NB: Does not contain other "C3" incoming ref.

      // Everything (by keys).
      const res4 = await table.incoming({ range: ['A1', 'A2', 'C3'], force: true });
      expect(Object.keys(res4)).to.eql(['A2', 'C3']);
      expect(res4.A2.map(m => m.cell)).to.eql(['C3', 'A1']);
      expect(res4.C3.map(m => m.cell)).to.eql(['A1']);
    });

    it('include ref to [undefined] cell (data from passed `outRefs` param)', async () => {
      const ctx = testContext({
        A1: { value: '=A2' },
      });
      const table = refs.table({ ...ctx });

      const res1 = await table.incoming();
      expect(res1).to.eql({}); // NB: The undefined cell (A2) was not picked up (because it was not returned by `getKeys`).

      // Pass in a set of `outgoing-refs` to include in key evaluation.
      const outRefs = await table.outgoing();
      const res2 = await table.incoming({ outRefs, force: true });

      expect(Object.keys(res2)).to.eql(['A2']);
      expect(res2.A2.length).to.eql(1);
      expect(res2.A2[0].cell).to.eql('A1');
    });

    it('cache', async () => {
      let A1 = '=SUM(A2,C3)';
      const ctx = testContext({
        A1: { value: () => A1 },
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

      // Cache reset.
      table.reset();
      const res5 = await table.incoming();
      expect(res4.A2).to.not.equal(res5.A2);

      // Changed value.
      A1 = '=SUM(123, A2)';
      const res6 = await table.incoming();
      const res7 = await table.incoming({ force: true });

      expect(res6).to.eql(res5); // NB: Cached value (no change).
      expect(res7).to.not.eql(res6);

      expect(Object.keys(res6)).to.eql(['A2', 'C3']);
      expect(Object.keys(res7)).to.eql(['A2']);
    });
  });

  describe('cache', () => {
    it('.reset() - everything', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(A2,C3)' },
        A2: { value: 123 },
        C3: { value: '=A2' },
      });
      const table = refs.table({ ...ctx });

      const res1 = await table.refs();
      const res2 = await table.refs();

      // Cached instances.
      expect(res1.in.A2).to.equal(res2.in.A2);
      expect(res1.out.A1).to.equal(res2.out.A1);

      table.reset();
      const res3 = await table.refs();
      expect(res2.in.A2).to.not.equal(res3.in.A2);
      expect(res2.out.A1).to.not.equal(res3.out.A1);
    });

    it('.reset({ cache:IN/OUT })', async () => {
      const A1 = '=SUM(A2,C3)';
      const ctx = testContext({
        A1: { value: () => A1 },
        A2: { value: 123 },
        C3: { value: '=A2' },
      });
      const table = refs.table({ ...ctx });

      const res1 = await table.refs();
      const res2 = await table.refs();

      // Cached instances.
      expect(res1.in.A2).to.equal(res2.in.A2);
      expect(res1.out.A1).to.equal(res2.out.A1);

      // Reset INCOMING only.
      table.reset({ cache: ['IN'] });
      const res3 = await table.refs();
      expect(res2.in.A2).to.not.equal(res3.in.A2); //   New instance.
      expect(res2.out.A1).to.equal(res3.out.A1); //     No change.

      // Re-query, everything cached again.
      const res4 = await table.refs();
      expect(res3.in.A2).to.equal(res4.in.A2);
      expect(res3.out.A1).to.equal(res4.out.A1);

      // Reset OUTGOING only.
      table.reset({ cache: ['OUT'] });
      const res5 = await table.refs();
      expect(res4.in.A2).to.equal(res5.in.A2); //       No change.
      expect(res4.out.A1).to.not.equal(res5.out.A1); // New instance.

      // Re-query, everything cached again.
      const res6 = await table.refs();
      expect(res5.in.A2).to.equal(res6.in.A2);
      expect(res5.out.A1).to.equal(res6.out.A1);

      // Reset entire cache.
      table.reset({ cache: ['IN', 'OUT'] }); // NB: with params (default).
      const res7 = await table.refs();
      expect(res6.in.A2).to.not.equal(res7.in.A2);
      expect(res6.out.A1).to.not.equal(res7.out.A1);
    });

    // TEMP 🐷
    // it('not cached', async () => {
    //   const ctx = testContext({
    //     A1: { value: '=SUM(A2,C3)' },
    //     A2: { value: 123 },
    //     C3: { value: '=A2' },
    //   });
    //   const table = refs.table({ ...ctx });

    //   const res1 = table.cached({ key: 'A1' });
    //   const res2 = table.cached('A2');
    //   const res3 = table.cached('A3');

    //   expect(res1).to.eql([]);
    //   expect(res2).to.eql([]);
    //   expect(res3).to.eql([]);
    // });

    // it('is cached', async () => {
    //   const ctx = testContext({
    //     A1: { value: '=SUM(A2,C3)' },
    //     A2: { value: 123 },
    //     C3: { value: '=A2' },
    //   });
    //   const table = refs.table({ ...ctx });

    //   // Cache empty.
    //   expect(table.cached('A1')).to.eql([]);
    //   expect(table.cached('A2')).to.eql([]);
    //   expect(table.cached('C3')).to.eql([]);
    //   expect(table.cached('Z9')).to.eql([]);

    //   // OUTGOING items cached.
    //   await table.outgoing();
    //   expect(table.cached('A1')).to.eql(['OUT']);
    //   expect(table.cached('A2')).to.eql(['OUT']);
    //   expect(table.cached('C3')).to.eql(['OUT']);
    //   expect(table.cached('Z9')).to.eql([]);

    //   // Cache empty.
    //   table.reset();
    //   expect(table.cached('A1')).to.eql([]);
    //   expect(table.cached('A2')).to.eql([]);
    //   expect(table.cached('C3')).to.eql([]);
    //   expect(table.cached('Z9')).to.eql([]);

    //   // INCOMING items cached.
    //   await table.incoming();
    //   expect(table.cached('A1')).to.eql(['IN']);
    //   expect(table.cached('A2')).to.eql(['IN']);
    //   expect(table.cached('C3')).to.eql(['IN']);
    //   expect(table.cached('Z9')).to.eql([]);

    //   // Cache empty.
    //   table.reset();
    //   expect(table.cached('A1')).to.eql([]);
    //   expect(table.cached('A2')).to.eql([]);
    //   expect(table.cached('C3')).to.eql([]);
    //   expect(table.cached('Z9')).to.eql([]);

    //   // INCOMING/OUTGOING items cached.
    //   await table.refs();
    //   expect(table.cached('A1')).to.eql(['IN', 'OUT']);
    //   expect(table.cached('A2')).to.eql(['IN', 'OUT']);
    //   expect(table.cached('C3')).to.eql(['IN', 'OUT']);
    //   expect(table.cached('Z9')).to.eql([]);
    // });
  });
});
