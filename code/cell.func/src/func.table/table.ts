import { Subject } from 'rxjs';
import { coord, t, time, util } from '../common';
import { calculate as init } from '../func.calc';

const defaultGetFunc: t.GetFunc = async args => undefined; // NB: Empty stub.

/**
 * Prepares a table for calculating updates.
 */
export function table(args: {
  getCells: t.GetCells;
  getFunc?: t.GetFunc;
  refsTable?: t.IRefsTable;
  events$?: Subject<t.FuncEvent>;
}): t.IFuncTable {
  const { events$ } = args;

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
  const calculate = init({ getValue, getFunc, events$ });
  let lastRefs: t.IRefs | undefined; // Local cache of last refs (for comparison)

  // Finish up.
  return {
    getCells,
    refsTable,
    getFunc,
    calculate(args = {}) {
      const eid = util.eid();
      const timer = time.timer();
      const promise = new Promise<t.IFuncTableResponse>(async (resolve, reject) => {
        const cells = args.cells || (await getKeys());

        // Calculate cell refs.
        const beforeRefs = lastRefs || (await refsTable.refs()); // NB: Current from cache.
        await refsTable.refs({ range: cells, force: true });
        const afterRefs = await refsTable.refs();

        // Trim off cells that are not within the specified set.
        afterRefs.in = { ...afterRefs.in };
        Object.keys(afterRefs.in)
          .filter(key => !cells.includes(key))
          .forEach(key => {
            delete afterRefs.in[key];
          });

        // Cache reference for next calculation comparison.
        lastRefs = afterRefs;

        // Calculate functions.
        const res = await calculate.many({ refs: afterRefs, cells, eid });
        const map: t.ICellTable = {};

        const addChange = async (args: {
          current?: t.ICellData;
          key: string;
          value: any;
          error?: t.IFuncError;
        }) => {
          const { key, value, error } = args;

          const currentProps = args.current ? args.current.props : undefined;
          const props: t.ICellProps | undefined = util.value.squashProps(
            args.value === undefined ? { ...currentProps } : { ...currentProps, value },
          );

          let cell: t.ICellData = args.current ? { ...args.current, props } : { props };
          cell = util.value.setError(cell, error);
          if (cell.props === undefined) {
            delete cell.props;
          }

          map[key] = cell;
        };
        await Promise.all(
          res.list.map(async item => {
            const { error } = item;
            const key = item.cell;
            const value = item.data;
            const current = await getCell(key);
            addChange({ current, key, value, error });
          }),
        );

        // Update cells that are no longer refs.
        const removedOutRefs = removedKeys(beforeRefs.out, afterRefs.out);
        await Promise.all(
          removedOutRefs.map(async key => {
            const value = await getValue(key);
            const error = undefined;
            if (value === undefined) {
              return addChange({ key, value, error });
            }
          }),
        );

        // Finish up.
        const { ok, list } = res;
        const elapsed = timer.elapsed.msec;
        resolve({ ok, eid, elapsed, list, map });
      });

      // Assign initial properties to the returned
      // promise for use prior to resolving.
      (promise as any).eid = eid;
      return promise as t.FuncPromise<t.IFuncTableResponse>;
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
