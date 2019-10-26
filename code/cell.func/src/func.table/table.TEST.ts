import { expect, toContext, t, coord } from '../test';
import { func } from '..';

export const testContext = async (cells: t.ICellTable | (() => t.ICellTable)) => {
  const { getValue, getFunc, getCells, refsTable } = await toContext(cells);
  return { getValue, getFunc, getCells, refsTable };
};

describe('func.table', () => {
  it('creates REFs table', async () => {
    const ctx = await testContext({
      A1: { value: '123' },
    });
    const { getFunc, getCells } = ctx;
    const res = func.table({ getFunc, getCells });

    expect(res.getCells).to.equal(getCells);
    expect(res.getFunc).to.equal(getFunc);
    expect(res.refsTable).to.be.an('object');
    expect(res.refsTable).to.not.equal(ctx.refsTable);
  });

  it('takes existing REFs table', async () => {
    const ctx = await testContext({
      A1: { value: '123' },
    });
    const res = func.table({ ...ctx });
    expect(res.refsTable).to.equal(ctx.refsTable);
  });

  describe('calculate', () => {
    it('calculates', async () => {
      const ctx = await testContext({
        A1: { value: '123' },
        A2: { value: '=A1+1' },
        A3: { value: '=A2+1' },
      });

      const table = func.table({ ...ctx });
      const res = await table.calculate();

      expect(res.ok).to.eql(true);
      expect(res.elapsed).to.be.a('number');
      expect(res.list.length).to.eql(2);

      // expect(res.from).to.eql({ A2: { value: '=A1+1' }, A3: { value: '=A2+1' } });
      // TEMP 🐷 res.to
    });

    it('has consistent eid ("execution" identifier) across all child funcs', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(1,2)' },
        A2: { value: '=3+4' },
      });

      const table = func.table({ ...ctx });
      const wait = table.calculate();

      const res = await wait;
      expect(res.list.every(item => item.eid === res.eid)).to.eql(true);
      expect(res.eid).to.eql(wait.eid);
    });

    it('subset (range)', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(1,A3)' },
        A2: { value: '=3+A3' },
        A3: { value: 5 },
        D1: { value: '=1+A3' },
      });

      const table = func.table({ ...ctx });
      const res1 = await table.calculate();
      const res2 = await table.calculate({ cells: 'A1' });

      expect(Object.keys(res1.map).sort()).to.eql(['A1', 'A2', 'D1']);
      expect(Object.keys(res2.map).sort()).to.eql(['A1']);
    });

    it('recalculate: REF removed (calculate all)', async () => {
      const cells1: t.ICellTable = {
        A1: { value: '=A2' },
        A2: { value: '=A3' },
        A3: { value: 123 },
      };
      const cells2: t.ICellTable = {
        A2: { value: '=A3' },
        A3: { value: 456 },
      };

      let cells = cells1;
      const ctx = await testContext(() => cells);
      const table = func.table({ ...ctx });

      const res1 = await table.calculate({});

      cells = cells2;
      const res2 = await table.calculate({});

      expect(Object.keys(res1.map).sort()).to.eql(['A1', 'A2']);
      expect(res2.map).to.eql({
        A1: {}, // NB: Empty object signifies removal.
        A2: { value: '=A3', props: { value: 456 } },
      });
    });

    it('recalculate: REF removed (calculate subset)', async () => {
      const cells1: t.ICellTable = {
        A1: { value: '=A2' },
        A2: { value: '=A3' },
        A3: { value: 123 },
      };
      const cells2: t.ICellTable = {
        A2: { value: '=A3' },
        A3: { value: 456 },
      };

      let cells = cells1;
      const ctx = await testContext(() => cells);
      const table = func.table({ ...ctx });

      const res1 = await table.calculate({ cells: 'A1' });

      cells = cells2;
      const res2 = await table.calculate({ cells: 'A1' });

      expect(Object.keys(res1.map)).to.eql(['A1']);
      expect(res2.map).to.eql({ A1: {} }); // NB: Empty object signifies removal.
    });

    it('recalculate: REF changed', async () => {
      const cells1: t.ICellTable = {
        A1: { value: '=SUM(A2, 1)' },
        A2: { value: '=A3' },
        A3: { value: 123 },
      };
      const cells2: t.ICellTable = {
        A1: { value: '=SUM(2, 1)' },
        A2: { value: '66' },
        A3: { value: 456 },
      };

      let cells = cells1;
      const ctx = await testContext(() => cells);
      const table = func.table({ ...ctx });

      const res1 = await table.calculate({ cells: ['A1'] });

      console.log('=============');
      cells = cells2;
      const res2 = await table.calculate({ cells: 'A1' });

      // console.log('res1.to', res1.to);
      console.log('res2.map', res2.map);

      //
    });

    it.skip('fails (with error)', async () => {
      //
    });

    it.skip('calculates parallel paths at the same time', async () => {
      //
    });
  });
});
