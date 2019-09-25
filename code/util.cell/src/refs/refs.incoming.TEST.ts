import { expect } from 'chai';

import { refs } from '.';
import { t } from '../common';

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

describe.only('refs.incoming', () => {
  it('empty', async () => {
    const ctx = testContext({});
    const res = await refs.incoming({ key: 'A1', ...ctx });
    expect(res).to.eql([]);
  });

  it.only('calculate all', async () => {
    const ctx = testContext({
      A1: { value: '=SUM(A2,D5)' },
      A2: { value: '=D5' },
      D5: { value: 456 },
    });

    const res = await refs.incoming({ key: 'D5', ...ctx });

    console.log('-------------------------------------------');
    console.log('res', res);
  });
});
