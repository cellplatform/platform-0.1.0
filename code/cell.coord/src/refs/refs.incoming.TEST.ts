import { expect, testContext } from './TEST';
import { refs } from '.';
import { MemoryCache } from '../common';

describe('refs.incoming', () => {
  it('empty', async () => {
    const ctx = testContext({
      D5: { value: 123 },
    });
    const res = await refs.incoming({ key: 'A1', ...ctx });
    expect(res).to.eql([]);
  });

  it('calculate all', async () => {
    const ctx = testContext({
      A1: { value: '=SUM(A2,D5)' },
      A2: { value: '=D5' },
      D5: { value: 123 },
      D6: { value: 456 },
    });

    const res1 = await refs.incoming({ key: 'A1', ...ctx });
    const res2 = await refs.incoming({ key: 'A2', ...ctx });
    const res3 = await refs.incoming({ key: 'D5', ...ctx });

    expect(res1).to.eql([]);
    expect(res2.map(ref => ref.cell)).to.eql(['A1']);
    expect(res3.map(ref => ref.cell)).to.eql(['A2', 'A1']);
  });

  it('incoming REF to undefined cell', async () => {
    const ctx = testContext({
      A1: { value: '=A4' },
    });
    const res = await refs.incoming({ key: 'A4', ...ctx });
    expect(res.map(ref => ref.cell)).to.eql(['A1']);
  });

  it('incoming REF from RANGE', async () => {
    const ctx = testContext({
      A1: { value: '=B1:B9' },
      B1: { value: 1 },
      B5: { value: 5 },
      C1: { value: 'hello' },
    });
    const res1 = await refs.incoming({ key: 'B1', ...ctx });
    const res2 = await refs.incoming({ key: 'B5', ...ctx });
    const res3 = await refs.incoming({ key: 'C1', ...ctx });

    expect(res1.map(ref => ref.cell)).to.eql(['A1']);
    expect(res2.map(ref => ref.cell)).to.eql(['A1']);
    expect(res3).to.eql([]);
  });

  it('incoming REF from RANGE(param)', async () => {
    const ctx = testContext({
      A1: { value: '=SUM(B1:B9)' },
      B1: { value: 1 },
      B5: { value: 5 },
    });
    const res1 = await refs.incoming({ key: 'B1', ...ctx });
    const res2 = await refs.incoming({ key: 'B5', ...ctx });
    const res3 = await refs.incoming({ key: 'C1', ...ctx });

    expect(res1.map(ref => ref.cell)).to.eql(['A1']);
    expect(res2.map(ref => ref.cell)).to.eql(['A1']);
    expect(res3).to.eql([]);
  });

  it('cache', async () => {
    const ctx = testContext({
      A1: { value: '=SUM(A2,D5)' },
      A2: { value: '=D5' },
      D5: { value: 123 },
    });

    const cache = MemoryCache.create();
    const res1 = await refs.incoming({ key: 'D5', ...ctx });
    const res2 = await refs.incoming({ key: 'D5', ...ctx, cache });
    const res3 = await refs.incoming({ key: 'D5', ...ctx, cache });

    // Cached instance comparison.
    expect(res1).to.not.equal(res2);
    expect(res2).to.equal(res3); // NB: Cached.

    // Cached value comparison.
    expect(res1).to.eql(res2);
    expect(res2).to.eql(res3);
  });
});
