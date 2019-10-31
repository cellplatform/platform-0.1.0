import { func, t } from '../../common';

/**
 * API for calculating updates to grid references/functions.
 */
export function calc(args: { grid: t.IGrid; getFunc?: t.GetFunc }): t.IGridCalculate {
  const { grid, getFunc } = args;
  const getCells: t.GetCells = async () => grid.data.cells;
  const table = func.table({ getCells, getFunc, refsTable: grid.refs });

  /**
   * Calculate a set of changes.
   */
  const changes: t.IGridCalculate['changes'] = async (args: { cells?: string | string[] } = {}) => {
    const { cells } = args;
    const res = await table.calculate({ cells });
    return res;
  };

  /**
   * Calculate a set of changes and update the grid.
   */
  const update: t.IGridCalculate['update'] = async (args: { cells?: string | string[] } = {}) => {
    const { cells } = args;
    const res = await changes({ cells });
    grid.changeCells(res.map);
    return res;
  };

  // Finish up.
  return { changes, update };
}
