import { expect } from 'chai';

import { t } from '../common';
import { sys } from '../func.sys';
import { refs } from '../refs';

/**
 * Shared test helpers.
 */
export { expect };
export type TestTable = t.ICoordTable<{ value: any }>;
export const testContext = async (cells: TestTable) => {
  const getValue: t.RefGetValue = async (key: string) => {
    const cell = cells[key];
    const value = cell ? cell.value : undefined;
    return typeof value === 'function' ? value() : value;
  };
  const getKeys: t.RefGetKeys = async () => Object.keys(cells);
  const table = refs.table({ getKeys, getValue });
  return { getValue, getFunc, refs: await table.refs() };
};

export const getFunc: t.GetFunc = async args => {
  const res = await sys.getFunc(args);
  // NB: Inject other functions here.
  return res ? res : undefined;
};
