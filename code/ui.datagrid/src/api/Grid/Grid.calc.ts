import { coord, func, t, util } from '../../common';

const defaultGetFunc: t.GetFunc = async args => undefined; // NB: Empty stub.

/**
 * API for calculating updates to grid references/functions.
 */
export function calc(args: { getFunc?: t.GetFunc; grid: t.IGrid }): t.IGridCalculate {
  const { grid } = args;
  const getFunc = args.getFunc || defaultGetFunc;

  const getKeys: t.RefGetKeys = async () => Object.keys(grid.cells);

  const getCell: t.GetGridCell = async (key: string) => grid.cells[key];

  const getValue: t.RefGetValue = async key => {
    const cell = grid.cells[key];
    const value = cell ? cell.value : undefined;
    return typeof value === 'function' ? value() : value;
  };

  const table = coord.refs.table({ getKeys, getValue });
  const calculate = func.calculate({ getValue, getFunc });

  /**
   * Calculate a set of changes.
   */
  const changes: t.IGridCalculate['changes'] = async (args: { cells?: string | string[] } = {}) => {
    const cells = args.cells || (await getKeys());

    // Calculate cell refs.
    const beforeRefs = await table.refs(); // NB: Current from cache.
    await table.refs({ range: cells, force: true });
    const afterRefs = await table.refs();

    // Calculate functions.
    const res = await calculate.many({ refs: afterRefs, cells });

    // Prepare grid update set.
    const from: t.IGridCellsData = {};
    const to: t.IGridCellsData = {};

    const addChange = async (key: string, value: any, error: t.IFuncError | undefined) => {
      const cell = await getCell(key);
      if (cell) {
        const props = util.setCellError({
          props: value === undefined ? { ...cell.props } : { ...cell.props, value },
          error,
        });
        from[key] = cell;
        to[key] = { ...cell, props };
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
    return { func: res, from, to, cells: res.list.map(f => f.cell) };
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

function removedKeys(before: object, after: object) {
  const keys = Object.keys(after);
  return Object.keys(before).filter(key => !keys.includes(key));
}
