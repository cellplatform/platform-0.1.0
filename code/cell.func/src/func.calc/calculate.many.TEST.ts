import { expect, Subject, t, toContext } from '../test';
import { many } from './calculate.many';

export const testContext = async (
  cells: t.ICellMap,
  options: { getFunc?: t.GetFunc; delay?: number; refsRange?: string | string[] } = {},
) => {
  const { getValue, getFunc, refsTable } = await toContext(cells, options);
  const refs = await refsTable.refs({ range: options.refsRange });
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
      D1: { value: '=1+B2' },
    });
    const res1 = await many({ cells: 'C1', ...ctx });
    const res2 = await many({ cells: ['C1', 'D1'], ...ctx });

    const cells1 = res1.list.map(e => e.cell);
    const cells2 = res2.list.map(e => e.cell);

    expect(cells1.length).to.eql(2);
    expect(cells1.includes('B1')).to.eql(true);
    expect(cells1.includes('A1')).to.eql(true);

    expect(res1.map.A1.data).to.eql(9);
    expect(res1.map.B1.data).to.eql(6);

    expect(cells2.length).to.eql(3);
    expect(cells2.includes('B1')).to.eql(true);
    expect(cells2.includes('A1')).to.eql(true);
    expect(cells2.includes('D1')).to.eql(true);

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

  describe('error', () => {
    it('error: circular-ref (via FUNC => PARAM => RANGE)', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(A2:A10)' },
        A2: { value: '=1+2' },
        A3: { value: '=A1' },
      });
      const res = await many({ cells: ['A1'], ...ctx });
      const list = res.list;

      expect(res.ok).to.eql(false);
      expect(list.every(({ ok }) => ok === false)).to.eql(true);
      expect(list.every(({ error }) => error && error.type === 'REF/circular')).to.eql(true);
    });

    it('error: circular ref (A2 => [A1 => A1])', async () => {
      const ctx = await testContext(
        {
          A1: { value: '=A1' },
          A2: { value: '=A1' },
        },
        { refsRange: 'A2' }, // NB: Narrow the REFs recalculation to simulate the narrowest recalculation based on cell-input change.
      );

      const res = await many({ cells: ['A2'], ...ctx });
      const list = res.list;

      expect(res.ok).to.eql(false);
      expect(list.every(({ ok }) => ok === false)).to.eql(true);
      expect(list.every(({ error }) => error && error.type === 'REF/circular')).to.eql(true);
    });
  });
});
