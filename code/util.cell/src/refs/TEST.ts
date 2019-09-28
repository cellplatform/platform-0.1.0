export { expect } from 'chai';
import { t } from '../common';

export type TestTable = t.ICoordTable<{ value: any }>;

export const testContext = (cells: TestTable) => {
  const getValue: t.RefGetValue = async (key: string) => {
    const cell = cells[key];
    const value = cell ? cell.value : undefined;
    return typeof value === 'function' ? value() : value;
  };
  const getKeys: t.RefGetKeys = async () => Object.keys(cells);
  return { getKeys, getValue };
};
