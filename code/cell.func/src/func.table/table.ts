import { t, coord, util, time } from '../common';
import { calculate as init } from '../func.calc';

const defaultGetFunc: t.GetFunc = async args => undefined; // NB: Empty stub.

/**
 * Prepares a table for calculating updates.
 */
export function table(args: {
  getCells: t.GetCells;
  getFunc?: t.GetFunc;
  refsTable?: t.IRefsTable;
}): t.IFuncTable {
  // Prepare data retrieval factories.
  const getFunc = args.getFunc || defaultGetFunc;
  const getCells = args.getCells;
  const getCell: t.GetCell = async (key: string) => (await getCells())[key];
  const getKeys: t.RefGetKeys = async () => Object.keys(await getCells());
  const getValue: t.RefGetValue = async key => {
    const cell = await getCell(key);
    const value = cell ? cell.value : undefined;
    return typeof value === 'function' ? value() : value;
  };

  // Prepare calculators.
  const refsTable = args.refsTable || coord.refs.table({ getKeys, getValue });
  const calculate = init({ getValue, getFunc });

  // Finish up.
  return {
    getCells,
    refsTable,
    getFunc,
    async calculate(args = {}): Promise<t.IFuncTableResponse> {
      const timer = time.timer();
      const cells = args.cells || (await getKeys());

      // Calculate cell refs.
      const beforeRefs = await refsTable.refs(); // NB: Current from cache.
      await refsTable.refs({ range: cells, force: true });
      const afterRefs = await refsTable.refs();

      // Calculate functions.
      const res = await calculate.many({ refs: afterRefs, cells });

      // Prepare [from/to] update set.
      const from: t.ICellTable = {};
      const to: t.ICellTable = {};
      const addChange = async (key: string, value: any, error: t.IFuncError | undefined) => {
        const cell = await getCell(key);
        if (cell) {
          const props = value === undefined ? { ...cell.props } : { ...cell.props, value };
          from[key] = cell;
          to[key] = util.value.setError({ ...cell, props }, error);
        }
      };
      await Promise.all(res.list.map(item => addChange(item.cell, item.data, item.error)));

      // Update cells that are no longer refs.
      const removedOutRefs = removedKeys(beforeRefs.out, afterRefs.out);
      await Promise.all(
        removedOutRefs.map(async key => {
          const value = await getValue(key);
          const error = undefined;
          return addChange(key, value, error);
        }),
      );

      // Finish up.
      const { ok, list } = res;
      const elapsed = timer.elapsed.msec;
      return { ok, elapsed, list, from, to };
    },
  };
}

/**
 * [Helpers]
 */
function removedKeys(before: object, after: object) {
  const keys = Object.keys(after);
  return Object.keys(before).filter(key => !keys.includes(key));
}
