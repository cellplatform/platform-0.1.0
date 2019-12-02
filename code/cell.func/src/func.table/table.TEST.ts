import { expect, toContext, t, util } from '../test';
import { func } from '..';

export const testContext = async (
  cells: t.ICellMap | (() => t.ICellMap),
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

      expect(util.value.cellData(res.map.A2).getValue()).to.eql(124);
      expect(util.value.cellData(res.map.A3).getValue()).to.eql(125);
    });

    it('calculates with delay', async () => {
      const cells: t.ICellMap = {
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

      expect(util.value.cellData(res1.map.A2).getValue()).to.eql(124);
      expect(util.value.cellData(res1.map.A3).getValue()).to.eql(125);

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
        Z1: { value: 'not involved' },
        Z9: { value: '=Z1' },
      });

      const table = func.table({ ...ctx });
      const res1 = await table.calculate();
      const res2 = await table.calculate({ cells: 'A1' });

      expect(Object.keys(res1.map).sort()).to.eql(['A1', 'A2', 'D1', 'Z9']);
      expect(Object.keys(res2.map).sort()).to.eql(['A1', 'A2', 'D1']); // NB: This could probably trimmed down, it includes cells that ref the same thing, but are not part of the calculation.
    });

    it('recalculate: REF removed (calculate all)', async () => {
      const cells1: t.ICellMap = {
        A1: { value: '=A2' },
        A2: { value: '=A3' },
        A3: { value: 123 },
      };
      const cells2: t.ICellMap = {
        A2: { value: '=A3' },
        A3: { value: 456 },
      };

      let cells = cells1;
      const ctx = await testContext(() => cells);
      const table = func.table({ ...ctx });

      const res1 = await table.calculate();

      cells = cells2;
      const res2 = await table.calculate();

      expect(Object.keys(res1.map).sort()).to.eql(['A1', 'A2']);
      expect(res2.map).to.eql({
        A2: { value: '=A3', props: { value: 456 }, error: undefined },
      });
    });

    it('recalculate: REF removed (calculate subset)', async () => {
      const cells1: t.ICellMap<any> = {
        A1: { value: '=A2' },
        A2: { value: '=A3' },
        A3: { value: 123 },
        A4: { value: '=A1', props: { style: { bold: true } } },
        Z9: { value: 'Z9' },
      };
      const cells2: t.ICellMap<any> = {
        A2: { value: '=A3' },
        A3: { value: 456 },
        A4: { value: '=A1', props: { value: 123, style: { bold: true } } },
        Z9: { value: 'Z9' },
      };

      let cells = cells1;
      const ctx = await testContext(() => cells);
      const table = func.table({ ...ctx });

      const res1 = await table.calculate({ cells: 'A1' });
      expect(Object.keys(res1.map).sort()).to.eql(['A1', 'A2', 'A4']);

      cells = cells2;
      const res2 = await table.calculate({ cells: 'A1' });
      const A4 = res2.map.A4 as t.ICellData;

      expect(Object.keys(res2.map).sort()).to.eql(['A4']);
      expect(A4.props).to.eql({ style: { bold: true } });
    });

    it('recalculate: REF changed', async () => {
      const cells1: t.ICellMap = {
        A1: { value: '=SUM(A2, 1)' },
        A2: { value: '=A3' },
        A3: { value: 123 },
      };
      const cells2: t.ICellMap = {
        A1: { value: '=SUM(2, 1)' },
        A2: { value: '66' },
        A3: { value: 456 },
      };

      let cells = cells1;
      const ctx = await testContext(() => cells);
      const table = func.table({ ...ctx });

      const res1 = await table.calculate({ cells: ['A1'] });
      expect(util.value.cellData(res1.map.A1).getValue()).to.eql(124);

      cells = cells2;
      const res2 = await table.calculate({ cells: 'A1' });
      expect(util.value.cellData(res2.map.A1).getValue()).to.eql(3);
    });

    it('reports error when function not found, then removes it', async () => {
      let A1 = '=NO_EXIST()';
      const ctx = await testContext({
        A1: { value: () => A1 },
      });
      const table = func.table({ ...ctx });

      const res1 = await table.calculate();
      A1 = '=1+2'; // Correct the error.
      const res2 = await table.calculate();

      expect(res1.ok).to.eql(false);
      expect(res2.ok).to.eql(true);

      const A1a = res1.map.A1 || {};
      const A1b = res2.map.A1 || {};
      const error = A1a.error;

      expect(A1a.props).to.eql(undefined);
      expect(error && error.type).to.eql('FUNC/notFound');
      expect(error && error.message).to.contain(`The function [sys.NO_EXIST] was not found`);

      // NB: Error removed from corrected re-calculation.
      expect(A1b.props).to.eql({ value: 3 });
      expect(A1b.error).to.eql(undefined);
      expect(Object.keys(A1b)).to.include('error'); // NB: Key included: {error:undefined} (so that we know to remove it from the DB).
    });

    it.skip('calculates parallel paths at the same time', async () => {
      //
    });

    describe('error', () => {
      it('error: getFunc throws', async () => {
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

      it('error: circular ref (self: A1 => A1)', async () => {
        let A1 = '123';
        const ctx = await testContext({
          A1: { value: () => A1 },
        });

        const table = func.table({ ...ctx });
        const res1 = await table.calculate();
        expect(res1.list).to.eql([]);

        A1 = '=A1';
        const res2 = await table.calculate({ cells: ['A1'] });

        const error = res2.list[0].error as t.IFuncErrorCircularRef;
        expect(error.type).to.eql('REF/circular');
        expect(error.path).to.eql('A1/A1');
        expect(error.formula).to.eql('=A1');
      });

      it('error: circular ref (A2 => [A1 => A1])', async () => {
        let A2 = '123';
        const ctx = await testContext({
          A1: { value: '=A1' },
          A2: { value: () => A2 },
        });

        const table = func.table({ ...ctx });
        const res1 = await table.calculate();
        expect((res1.list[0].error as t.IFuncErrorCircularRef).type).to.eql('REF/circular');

        A2 = '=A1';

        const res2 = await table.calculate();
        expect(res2.list.length).to.eql(2);
        expect((res2.list[0].error as t.IFuncErrorCircularRef).type).to.eql('REF/circular');
        expect((res2.list[1].error as t.IFuncErrorCircularRef).type).to.eql('REF/circular');

        const res3 = await table.calculate({ cells: ['A2'] });
        const list = res3.list;

        expect(res3.ok).to.eql(false);
        expect(list.length).to.eql(2);
        expect(list.every(({ ok }) => ok === false)).to.eql(true);
        expect(list.every(({ error }) => error && error.type === 'REF/circular')).to.eql(true);
      });
    });
  });
});
