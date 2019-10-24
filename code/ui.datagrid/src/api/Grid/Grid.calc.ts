import { coord, func, t, util } from '../../common';

const defaultGetFunc: t.GetFunc = async args => undefined; // NB: Empty stub.

/**
 * API for calculating updates to grid references/functions.
 */
export function calc(args: {
  grid: t.IGrid;
  getFunc?: t.GetFunc;
  refsTable?: t.IRefsTable;
}): t.IGridCalculate {
  const { grid, refsTable } = args;
  const getFunc = args.getFunc || defaultGetFunc;

  // const getKeys: t.RefGetKeys = async () => Object.keys(grid.data.cells);

  // const getCell: t.GetGridCell = async (key: string) => grid.data.cells[key];

  // const getValue: t.RefGetValue = async key => {
  //   const cell = grid.data.cells[key];
  //   const value = cell ? cell.value : undefined;
  //   return typeof value === 'function' ? value() : value;
  // };

  const getCells: t.GetCells = async () => grid.data.cells;

  const tbl = func.table({ getCells, getFunc, refsTable });

  // const table = coord.refs.table({ getKeys, getValue });
  // const calculate = func.calculate({ getValue, getFunc });

  /**
   * Calculate a set of changes.
   */
  const changes: t.IGridCalculate['changes'] = async (args: { cells?: string | string[] } = {}) => {
    // const range = args.cells || (await getKeys());

    const res = await tbl.calculate({ range: args.cells });

    return res;

    // // Calculate cell refs.
    // const beforeRefs = await table.refs(); // NB: Current from cache.
    // await table.refs({ range: cells, force: true });
    // const afterRefs = await table.refs();

    // // Calculate functions.
    // const res = await calculate.many({ refs: afterRefs, cells });

    // // Prepare grid update set.
    // const from: t.IGridData['cells'] = {};
    // const to: t.IGridData['cells'] = {};
    // const addChange = async (key: string, value: any, error: t.IFuncError | undefined) => {
    //   const cell = await getCell(key);
    //   if (cell) {
    //     const props = value === undefined ? { ...cell.props } : { ...cell.props, value };
    //     from[key] = cell;
    //     to[key] = util.cell.value.setError({ ...cell, props }, error);
    //   }
    // };
    // await Promise.all(res.list.map(item => addChange(item.cell, item.data, item.error)));

    // // Update cells that are no longer refs.
    // const removedOutRefs = removedKeys(beforeRefs.out, afterRefs.out);
    // await Promise.all(
    //   removedOutRefs.map(async key => {
    //     const value = await getValue(key);
    //     const error = undefined;
    //     return addChange(key, value, error);
    //   }),
    // );

    // // Finish up.
    // return { func: res, from, to, cells: res.list.map(f => f.cell) };
  };

  /**
   * Calculate a set of changes and update the grid.
   */
  const update: t.IGridCalculate['update'] = async (args: { cells?: string | string[] } = {}) => {
    const { cells } = args;
    const res = await changes({ cells });
    grid.changeCells(res.to);
    return res;
  };

  // Finish up.
  return { changes, update };
}

/**
 * [Helpers]
 */

// function removedKeys(before: object, after: object) {
//   const keys = Object.keys(after);
//   return Object.keys(before).filter(key => !keys.includes(key));
// }
