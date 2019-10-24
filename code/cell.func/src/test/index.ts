import { expect } from 'chai';
import { t, valueUtil, coord, time } from '../common';
export * from '../common';

const refs = coord.refs;

/**
 * Shared test helpers.
 */
export { expect, t, coord };
export { Observable, Subject } from 'rxjs';

export const toContext = async (
  cells: t.ICellTable,
  options: { getFunc?: t.GetFunc; delay?: number } = {},
) => {
  const getCells: t.GetCells = async () => cells;

  const getValue: t.RefGetValue = async (key: string) => {
    const cell = cells[key];
    const value = cell ? cell.value : undefined;
    return typeof value === 'function' ? value() : value;
  };
  const getKeys: t.RefGetKeys = async () => Object.keys(cells);

  const refsTable = refs.table({ getKeys, getValue });
  return {
    cells,
    getValue,
    getFunc: async (args: t.IGetFuncArgs) => {
      const res = (options.getFunc || getFunc) as t.GetFunc;
      if (typeof options.delay === 'number') {
        await time.wait(options.delay);
      }
      return res(args);
    },
    getCells,
    refsTable,
    refs: await refsTable.refs(),
  };
};

export const getFunc: t.GetFunc = async args => {
  const res = await sys.getFunc(args);
  // NB: Inject other functions here 🌳
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
      .map(p => (typeof p === 'string' ? valueUtil.toNumber(p) : p) as number)
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
