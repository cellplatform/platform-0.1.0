import * as coord from '@platform/util.cell';

import { Grid } from '../../api';
import { constants } from '../../common';

const { DEFAULT } = constants;

export function sizeHandlers(getGrid: () => Grid) {
  /**
   * Store the `column width` data after a manual resize.
   * - https://handsontable.com/docs/6.2.2/Hooks.html#event:afterColumnResize
   */
  function afterColumnResize(index: number, width: number, isDoubleClick: boolean) {
    const grid = getGrid();
    if (grid) {
      const key = coord.cell.toKey(index, undefined);
      let column = grid.columns[key];
      width = isDoubleClick
        ? grid.defaults.columWidth
        : Math.max(grid.defaults.columnWidthMin, width);
      column = { ...(column || {}), width };
      grid
        .changeColumns(
          { [key]: { ...(column || {}), width } },
          { source: isDoubleClick ? 'RESET/doubleClick' : 'UPDATE' },
        )
        .redraw();
    }
  }

  /**
   * Store the `row height` data after a manual resize.
   * - https://handsontable.com/docs/6.2.2/Hooks.html#event:afterRowResize
   */
  function afterRowResize(index: number, height: number, isDoubleClick: boolean) {
    const grid = getGrid();
    if (grid) {
      const key = coord.cell.toKey(undefined, index);
      let row = grid.rows[key];
      height = isDoubleClick
        ? grid.defaults.rowHeight
        : Math.max(grid.defaults.rowHeightMin, height);
      row = { ...(row || {}), height };
      grid
        .changeRows(
          { [key]: { ...(row || {}), height } },
          { source: isDoubleClick ? 'RESET/doubleClick' : 'UPDATE' },
        )
        .redraw();
    }
  }

  /**
   * Ensure `column width` is retrieved from state.
   * - https://handsontable.com/docs/6.2.2/Hooks.html#event:modifyColWidth
   */
  function modifyColWidth(width: number, index: number) {
    const grid = getGrid();
    if (grid) {
      const key = coord.cell.toKey(index, undefined);
      const column = grid.columns[key];
      width = column && column.width !== undefined ? column.width : grid.defaults.columWidth;
    }
    return width;
  }

  /**
   * Ensure `row height` is retrieved from state.
   * - https://handsontable.com/docs/6.2.2/Hooks.html#event:modifyRowHeight
   */
  function modifyRowHeight(height: number, index: number) {
    const grid = getGrid();
    if (grid) {
      const key = coord.cell.toKey(undefined, index);
      const row = grid.rows[key];
      height = row && row.height !== undefined ? row.height : grid.defaults.rowHeight;
    }
    return height;
  }

  return {
    afterColumnResize,
    afterRowResize,
    modifyColWidth,
    modifyRowHeight,
  };
}
