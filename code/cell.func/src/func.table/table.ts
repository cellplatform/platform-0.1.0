import { Subject } from 'rxjs';
import { coord, t, time, util, MemoryCache, R } from '../common';
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
  const cache = args.refsTable ? args.refsTable.cache : MemoryCache.create();
  const refsTable = args.refsTable || coord.refs.table({ getKeys, getValue, cache });
  const calc = init({ getValue, getFunc, events$ });

  const appendIncoming = async (keys: string[]) => {
    const incoming: string[] = [];
    await Promise.all(
      keys.map(async key => {
        const refs = await coord.refs.incoming({ key, getValue, getKeys, cache });
        refs.forEach(ref => incoming.push(ref.cell));
      }),
    );
    return R.uniq([...keys, ...incoming]);
  };

  const calculate: t.IFuncTable['calculate'] = (args = {}) => {
    const eid = util.eid();
    const timer = time.timer();
    const promise = new Promise<t.IFuncTableResponse>(async (resolve, reject) => {
      // Determine cells and refs to calculate.
      const cells = args.cells
        ? Array.isArray(args.cells)
          ? args.cells
          : [args.cells]
        : await getKeys();
      const refs = await refsTable.refs({ range: await appendIncoming(cells), force: true });

      // Invoke the functions.
      const res = await calc.many({ cells, refs, eid });
      const map: t.ICellTable = {};

      const addChange = async (args: {
        current?: t.ICellData;
        key: string;
        value: any;
        error?: t.IFuncError;
      }) => {
        const { key, error } = args;
        const value = util.value.isEmptyCellValue(args.value) ? undefined : args.value;
        const currentProps = args.current ? args.current.props : undefined;
        const props = util.value.squashProps({ ...currentProps, value });

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

      // Finish up.
      const { ok, list } = res;
      const elapsed = timer.elapsed.msec;
      resolve({ ok, eid, elapsed, list, map });
    });

    // Assign initial properties to the returned
    // promise for use prior to resolving.
    (promise as any).eid = eid;
    return promise as t.FuncPromise<t.IFuncTableResponse>;
  };

  // Finish up.
  return {
    cache,
    getCells,
    refsTable,
    getFunc,
    calculate,
  };
}
