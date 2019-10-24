import { expect, toContext, t, coord } from '../test';
import { func } from '..';

export const testContext = async (cells: t.ICellTable) => {
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
      expect(res.from).to.eql({ A2: { value: '=A1+1' }, A3: { value: '=A2+1' } });

      // console.log('TODO', 'res.to test');

      // res.to
    });

    it.skip('recalculate: keys removed', async () => {
      //
    });

    it.skip('subset (range)', async () => {
      //
    });

    it.skip('fails (with error)', async () => {
      //
    });
  });
});
