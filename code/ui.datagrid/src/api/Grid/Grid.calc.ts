import { filter, map } from 'rxjs/operators';
import { coord, t } from '../../common';

const defaultGetFunc: t.GetFunc = async args => undefined; // NB: Empty stub.

/**
 * Manage keeping the grid calculations up-to-date.
 */

/**
 * API for calculating updates to grid references/functions.
 */
export function calc(args: { getFunc?: t.GetFunc; grid: t.IGrid }): t.IGridCalculate {
  const { grid } = args;
  const getFunc = args.getFunc || defaultGetFunc;

  const getKeys: t.RefGetKeys = async () => Object.keys(grid.values);

  const getCell: t.GridGetCell = async (key: string) => grid.values[key];

  const getValue: t.RefGetValue = async key => {
    const cell = grid.values[key];
    const value = cell ? cell.value : undefined;
    return typeof value === 'function' ? value() : value;
  };

  const table = coord.refs.table({ getKeys, getValue });
  const calculate = coord.func.calculate({ getValue, getFunc });

  /**
   * Calculate a set of changes.
   */
  const changes: t.IGridCalculate['changes'] = async (args: { cells?: string | string[] } = {}) => {
    const cells = args.cells || (await getKeys());

    // Calculate updates.
    await table.refs({ range: cells, force: true });
    const refs = await table.refs({});
    const func = await calculate.many({ refs, cells });

    // Prepare grid update set.
    const from: t.IGridCells = {};
    const to: t.IGridCells = {};
    const addChange = async (key: string, value: any) => {
      const cell = await getCell(key);
      if (cell) {
        const props = value === undefined ? cell.props : { ...cell.props, value };
        from[key] = cell;
        to[key] = { ...cell, props };
      }
    };
    await Promise.all(func.list.map(item => addChange(item.cell, item.data)));

    // Finish up.
    return {
      func,
      from,
      to,
      cells: func.list.map(f => f.cell),
    };
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
