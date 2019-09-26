import { expect } from 'chai';
import { refs } from '.';
import { t, MemoryCache } from '../common';

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

  it('incoming ref to undefined cell', async () => {
    const ctx = testContext({
      A1: { value: '=A4' },
    });
    const res = await refs.incoming({ key: 'A4', ...ctx });
    expect(res.map(ref => ref.cell)).to.eql(['A1']);
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
