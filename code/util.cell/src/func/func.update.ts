import { R, t } from '../common';
import * as util from './util';
import { calculate } from './func.calculate';

/**
 * Calculate changes across a range of cells within a table.
 */
export async function update(args: {
  cells: string[];
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
}) {
  const { cells, refs, getValue, getFunc } = args;

  // Build complete list of cell implicated in the update.
  let keys: string[] = cells;
  const addIncoming = (cells: string[]) => {
    cells.forEach(key => (refs.in[key] || []).forEach(ref => keys.push(ref.cell)));
  };
  const addOutgoing = (cells: string[]) => {
    cells.forEach(key => (refs.out[key] || []).forEach(ref => keys.push(util.path(ref.path).last)));
  };
  addIncoming(cells);
  addOutgoing(cells);

  // De-dupe and topologically sort keys.
  // Order:
  //    LEAST-dependent => MOST-dependent
  //
  keys = util.sort({ refs, keys: R.uniq(keys) }).keys;
  const isKeyOfFormula = async (key: string) => util.isFormula(await getValue(key));

  // Calculate each cell that is a formula.
  const list: t.IFuncResponse[] = [];
  for (const cell of keys) {
    if (await isKeyOfFormula(cell)) {
      list.push(await calculate({ cell, refs, getValue, getFunc }));
    }
  }

  // Finish up.
  const ok = !list.some(item => !item.ok);
  let map: t.IFuncUpdateMap;
  return {
    ok,
    list,
    get map() {
      if (!map) {
        map = list.reduce((acc, next) => {
          acc[next.cell] = next;
          return acc;
        }, {});
      }
      return map;
    },
  };
}
