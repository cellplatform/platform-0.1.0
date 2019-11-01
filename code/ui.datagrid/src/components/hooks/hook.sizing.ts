import { Grid } from '../../api';
import { coord, t } from '../common';

export function sizeHandlers(grid: Grid) {
  /**
   * Store the `column width` data after a manual resize.
   * - https://handsontable.com/docs/6.2.2/Hooks.html#event:afterColumnResize
   */
  function afterColumnResize(index: number, width: number, isDoubleClick: boolean) {
    if (grid.isInitialized) {
      const key = coord.cell.toKey(index, undefined);
      width = isDoubleClick
        ? grid.defaults.columnWidth
        : Math.max(grid.defaults.columnWidthMin, width);
      grid
        .changeColumns(
          { [key]: toColumn(grid.data.columns[key], { width }) },
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
    if (grid.isInitialized) {
      const key = coord.cell.toKey(undefined, index);
      height = isDoubleClick
        ? grid.defaults.rowHeight
        : Math.max(grid.defaults.rowHeightMin, height);
      grid
        .changeRows(
          { [key]: toRow(grid.data.rows[key], { height }) },
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
    if (grid.isInitialized) {
      const key = coord.cell.toKey(index, undefined);
      const column = grid.data.columns[key];
      const props = column ? column.props : undefined;
      width = props && props.width !== undefined ? props.width : grid.defaults.columnWidth;
    }
    return width;
  }

  /**
   * Ensure `row height` is retrieved from state.
   * - https://handsontable.com/docs/6.2.2/Hooks.html#event:modifyRowHeight
   */
  function modifyRowHeight(height: number, index: number) {
    const key = coord.cell.toKey(undefined, index);
    const row = grid.data.rows[key];
    const props = row ? row.props : undefined;
    height = props && props.height !== undefined ? props.height : grid.defaults.rowHeight;
    return height;
  }

  return {
    afterColumnResize,
    afterRowResize,
    modifyColWidth,
    modifyRowHeight,
  };
}

/**
 * [Helpers]
 */
const toColumn = (input?: t.IColumnData, props?: t.IColumnProps) => {
  const res = { ...(input || {}) };
  return { ...res, props: { ...(res.props || {}), ...props } };
};

const toRow = (input?: t.IRowData, props?: t.IRowProps) => {
  const row = { ...(input || {}) };
  return { ...row, props: { ...(row.props || {}), ...props } };
};
