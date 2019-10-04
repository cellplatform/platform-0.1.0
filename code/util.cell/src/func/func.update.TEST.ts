import { expect, testContext, t } from './TEST';
import { func } from '.';

describe('func.changes', () => {
  it('single cell update involving: FUNC/REF/binary-expr', async () => {
    const ctx = await testContext({
      A1: { value: '=SUM(A2,A3)' },
      A2: { value: '=C1' },
      A3: { value: '=A2 + 2' },
      C1: { value: 5 },
      Z9: { value: 'hello' }, // NB: Not involved.
    });
    const res = await func.update({ cells: 'C1', ...ctx });

    expect(res.list.map(({ cell }) => cell)).to.eql(['A2', 'A3', 'A1']);
    expect(res.map.A1.data).to.eql(12);
    expect(res.map.A2.data).to.eql(5);
    expect(res.map.A3.data).to.eql(7);
  });

  it('multi cell update (FUNCS with no REFs)', async () => {
    const ctx = await testContext({
      A1: { value: '=SUM(1,2)' },
      A2: { value: '=3+4' },
      Z9: { value: 'hello' }, // NB: Not involved.
    });
    const res = await func.update({ cells: ['A1', 'A2'], ...ctx });
    expect(res.map.A1.data).to.eql(3);
    expect(res.map.A2.data).to.eql(7);
  });

  it('range', async () => {
    const ctx = await testContext({
      A1: { value: '=SUM(B1:B10)' },
      B1: { value: '=1+B2' },
      B2: { value: 5 },
      B3: { value: 3 },
    });
    const res = await func.update({ cells: 'A1', ...ctx });
    expect(res.list.length).to.eql(1);
    expect(res.map.A1.data).to.eql(14);
  });

  it.skip('range: update referenced value (includes incoming range)', async () => {
    const ctx = await testContext({
      A1: { value: '=SUM(B1:B10)' },
      B1: { value: '=1+C1' },
      C1: { value: 5 },
    });
    const res = await func.update({ cells: 'C1', ...ctx });

    console.log('-------------------------------------------');
    console.log('res', res);
    const cells = res.list.map(e => e.cell);
    console.log('keys', cells);

    expect(cells.includes('B1')).to.eql(true);
    expect(cells.includes('A1')).to.eql(true);

    /**
     * TEMP 🐷
     * - cache (pass around)
     * - IGrid : values => cells
     * - Test: error thrown in func (expected, eg throw new Error("foo"))
     * - Look up FUNC refs from somewhere else.
     * - Put calculation error response (cell display - somehow)
     * - Update involving range.
     */
  });

  it('error: circular-ref', async () => {
    const ctx = await testContext({
      A1: { value: '=SUM(A2:A10)' },
      A2: { value: '=1+2' },
      A3: { value: '=A1' },
    });
    const res = await func.update({ cells: ['A1'], ...ctx });
    expect(res.ok).to.eql(false);
  });
});
