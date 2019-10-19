import { expect } from 'chai';
import { t, value } from '../common';
import { refs } from '../refs';

/**
 * Shared test helpers.
 */
export { expect, t };
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

/**
 * Dummy system functions.
 */
export const sys = (() => {
  const sum: t.FuncInvoker = async args => {
    const params = paramsToNumbers(args.params);
    return params.length === 0
      ? 0
      : params.reduce((acc, next, i) => (i === 0 ? next : acc + next), 0);
  };

  function paramsToNumbers(input?: t.FuncParam[]) {
    return (input || [])
      .reduce(
        (acc, next) => {
          acc = Array.isArray(next) ? [...acc, ...next] : [...acc, next];
          return acc;
        },
        [] as any[],
      )
      .map(p => (typeof p === 'string' ? value.toNumber(p) : p) as number)
      .map(p => (typeof p === 'number' || typeof p === 'bigint' ? p : undefined))
      .filter(p => p !== undefined) as number[];
  }

  const getFunc: t.GetFunc = async args => {
    const { namespace, name } = args;
    if (namespace === 'sys') {
      switch (name) {
        case 'SUM':
          return sum;
      }
    }
    return undefined;
  };

  // Finish up.
  return { sum, getFunc };
})();
