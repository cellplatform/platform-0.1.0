import { expect, testContext, t } from './TEST';
import { func } from '.';

describe('func.changes', () => {
  it('Single cell update involving: FUNC/REF/binary-expr', async () => {
    const ctx = await testContext({
      A1: { value: '=SUM(A2,A3)' },
      A2: { value: '=C1' },
      A3: { value: '=A2 + 2' },
      C1: { value: 5 },
      Z9: { value: 'hello' }, // NB: Not involved.
    });
    const res = await func.update({ cells: ['C1'], ...ctx });

    expect(res.list.map(({ cell }) => cell)).to.eql(['A2', 'A3', 'A1']);
    expect(res.map.A1.data).to.eql(12);
    expect(res.map.A2.data).to.eql(5);
    expect(res.map.A3.data).to.eql(7);
  });
});

/**
 * TEMP 🐷
 * - cache (pass around)
 * - IGrid : values => cells
 * - Test: error thrown in func (expected, eg throw new Error("foo"))
 * - Look up FUNC refs from somewhere else.
 * - Put calculation error response (cell display - somehow)
 * - Update involving range.
 */
