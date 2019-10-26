import { expect, toContext, t, util } from '../test';
import { func } from '..';

export const testContext = async (
  cells: t.ICellTable | (() => t.ICellTable),
  options: { getFunc?: t.GetFunc; delay?: number } = {},
) => {
  const { getValue, getFunc, getCells, refsTable } = await toContext(cells, options);
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

      expect(util.value.cellPropValue(res.map.A2)).to.eql(124);
      expect(util.value.cellPropValue(res.map.A3)).to.eql(125);
    });

    it('calculates with delay', async () => {
      const cells: t.ICellTable = {
        A1: { value: '123' },
        A2: { value: '=A1+1' },
        A3: { value: '=A2+1' },
      };
      const ctx1 = await testContext(cells, {});
      const ctx2 = await testContext(cells, { delay: 10 });

      const table1 = func.table({ ...ctx1 });
      const table2 = func.table({ ...ctx2 });

      const res1 = await table1.calculate();
      const res2 = await table2.calculate();

      expect(util.value.cellPropValue(res1.map.A2)).to.eql(124);
      expect(util.value.cellPropValue(res1.map.A3)).to.eql(125);

      expect(res1.elapsed).to.lessThan(20);
      expect(res2.elapsed).to.greaterThan(20);
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
      expect(util.value.cellPropValue(res1.map.A1)).to.eql(124);

      cells = cells2;
      const res2 = await table.calculate({ cells: 'A1' });
      expect(util.value.cellPropValue(res2.map.A1)).to.eql(3);
    });

    it('fails (with error)', async () => {
      let count = 0;
      const ctx = await testContext(
        {
          A1: { value: '123' },
          A2: { value: '=A1+1' },
          A3: { value: '=A2+1' },
        },
        {
          getFunc: async args => {
            count++;
            return async args => {
              if (count > 2) {
                throw new Error('Fail');
              }
              return 888;
            };
          },
        },
      );
      const table = func.table({ ...ctx });
      const res = await table.calculate();
      expect((res.map.A2 as any).error).to.eql(undefined);

      const A3 = res.map.A3 as any;
      const error: t.IFuncError = A3.error;
      expect(error.type).to.eql('FUNC/invoke');
      expect(error.message).to.eql('Fail');
      expect(error.path).to.eql('A3');
      expect(error.formula).to.eql('=A2+1');
    });

    it.skip('calculates parallel paths at the same time', async () => {
      //
    });
  });
});
