import { expect } from 'chai';
import { t } from '../common';

/**
 * Shared test helpers.
 */
export { expect, t };
export type TestTable = t.IMap<{ value: any }>;

export const testContext = (cells: TestTable) => {
  const getValue: t.RefGetValue = async (key: string) => {
    const cell = cells[key];
    const value = cell ? cell.value : undefined;
    return typeof value === 'function' ? value() : value;
  };
  const getKeys: t.RefGetKeys = async () => Object.keys(cells);
  return { getKeys, getValue };
};
