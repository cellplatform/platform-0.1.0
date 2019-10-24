import { expect, Subject, t, toContext } from '../test';
import { many } from './calculate.many';

export const testContext = async (
  cells: t.ICellTable,
  options: { getFunc?: t.GetFunc; delay?: number } = {},
) => {
  const { refs, getValue, getFunc } = await toContext(cells, options);
  return { refs, getValue, getFunc };
};

describe('func.calc.cells (many)', function() {
  this.timeout(5000);

  it('response (promise)', async () => {
    const ctx = await testContext({
      A1: { value: '=SUM(1,2)' },
      A2: { value: '=3+4' },
    });
    const wait = many({ cells: ['A1', 'A2'], ...ctx });
    expect(wait.eid.length).to.greaterThan(3);

    const res = await wait;
    expect(res.eid.length).to.greaterThan(3);
    expect(res.eid).to.eql(wait.eid);
  });

  it('single cell update involving: FUNC/REF/binary-expr', async () => {
    const ctx = await testContext({
      A1: { value: '=SUM(A2,A3)' },
      A2: { value: '=C1' },
      A3: { value: '=A2 + 2' },
      C1: { value: 5 },
      Z9: { value: 'hello' }, // NB: Not involved.
    });
    const res = await many({ cells: 'C1', ...ctx });
    expect(res.elapsed).to.be.a('number');

    expect(res.list.map(({ cell }) => cell)).to.eql(['A2', 'A3', 'A1']);
    expect(res.map.A1.data).to.eql(12);
    expect(res.map.A2.data).to.eql(5);
    expect(res.map.A3.data).to.eql(7);
  });

  it('multi-cell update (FUNCS with no REFs)', async () => {
    const ctx = await testContext({
      A1: { value: '=SUM(1,2)' },
      A2: { value: '=3+4' },
      Z9: { value: 'hello' }, // NB: Not involved.
    });
    const res = await many({ cells: ['A1', 'A2'], ...ctx });
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
    const res = await many({ cells: 'A1', ...ctx });
    expect(res.list.length).to.eql(1);
    expect(res.map.A1.data).to.eql(14);
  });

  it('range: update referenced value (includes incoming range)', async () => {
    const ctx = await testContext({
      A1: { value: '=SUM(B1:B10)' },
      B1: { value: '=1+C1' },
      B2: { value: 3 },
      C1: { value: 5 },
    });
    const res = await many({ cells: 'C1', ...ctx });
    const cells = res.list.map(e => e.cell);

    expect(cells.includes('B1')).to.eql(true);
    expect(cells.includes('A1')).to.eql(true);

    expect(res.map.A1.data).to.eql(9);
    expect(res.map.B1.data).to.eql(6);

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
    const res = await many({ cells: ['A1'], ...ctx });
    expect(res.ok).to.eql(false);
    expect(res.elapsed).to.be.a('number');
  });

  it('has consistent eid ("execution" identifier) across all child funcs', async () => {
    const ctx = await testContext({
      A1: { value: '=SUM(1,2)' },
      A2: { value: '=3+4' },
      Z9: { value: 'hello' }, // NB: Not involved.
    });
    const res = await many({ cells: ['A1', 'A2'], ...ctx });
    expect(res.list.every(item => item.eid === res.eid)).to.eql(true);
  });

  it('events: FUNC/begin | FUNC/end', async () => {
    const ctx = await testContext({
      A1: { value: '=SUM(A2:A10)' },
      A2: { value: '=1+2' },
      A3: { value: '=A1' },
    });

    const events: t.FuncEvent[] = [];
    const events$ = new Subject<t.FuncEvent>();
    events$.subscribe(e => events.push(e));

    await many({ cells: ['A1'], events$, ...ctx });

    expect(events.length).to.eql(6);

    expect(events[0].type).to.eql('FUNC/many/begin');
    expect(events[1].type).to.eql('FUNC/begin');

    expect(events[events.length - 2].type).to.eql('FUNC/end');
    expect(events[events.length - 1].type).to.eql('FUNC/many/end');
  });
});
