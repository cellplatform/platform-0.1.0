import { cell as util } from '@platform/util.value.cell';

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
      const key = util.toKey(index);
      let column = grid.columns[key];
      width = isDoubleClick ? DEFAULT.COLUMN_WIDTH : Math.max(DEFAULT.COLUMN_WIDTH_MIN, width);
      column = { ...(column || {}), width };
      grid
        .changeColumns(
          { [key]: { ...(column || {}), width } },
          { type: isDoubleClick ? 'RESET/doubleClick' : 'UPDATE' },
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
      const key = index;
      let row = grid.rows[key];
      height = isDoubleClick ? DEFAULT.ROW_HEIGHT : Math.max(DEFAULT.ROW_HEIGHT_MIN, height);
      row = { ...(row || {}), height };
      grid
        .changeRows(
          { [key]: { ...(row || {}), height } },
          { type: isDoubleClick ? 'RESET/doubleClick' : 'UPDATE' },
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
      const key = util.toKey(index);
      const column = grid.columns[key];
      width = column && column.width !== undefined ? column.width : DEFAULT.COLUMN_WIDTH;
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
      const key = index;
      const row = grid.rows[key];
      height = row && row.height !== undefined ? row.height : DEFAULT.ROW_HEIGHT;
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
