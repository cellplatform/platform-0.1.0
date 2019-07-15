import { Grid } from '../../api';
import { t, cellUtil } from '../../common';

/**
 * Handles bubbling mouse events.
 * - https://handsontable.com/docs/6.2.2/Hooks.html
 *
 * NOTE:
 *    Currently this set of events does not catch the
 *    top-left row/column box (row:-1, column:-1).
 *
 */
export function mouseCell(getGrid: () => Grid, type: t.IGridMouse['type']) {
  return function(event: MouseEvent, coords: { row: number; col: number }, td: Element) {
    const grid = getGrid();

    // Determine cell type.
    const { row, col: column } = coords;
    const cell = cellUtil.cell.toKey(coords.col, coords.row);
    const cellType = cellUtil.cell.toType({ row, column }) as t.GridCellType;
    if (!cellType) {
      // const json = JSON.stringify(coords);
      // const msg = `Mouse: The cell type could not be derived for "${type}" event on ${json}.`;
      // log.warn(msg);
      return; // Ignore.
    }

    // Prepare event payload.
    const payload: t.IGridMouse = {
      cell,
      cellType,
      button: event.button === 2 ? 'RIGHT' : 'LEFT',
      grid,
      type,
      isCancelled: false,
      cancel: () => {
        event.preventDefault();
        event.stopImmediatePropagation();
        payload.isCancelled = true;
      },
    };

    // Fire event.
    grid.fire({ type: 'GRID/mouse', payload });
  } as any; // HACK: TS types on handsongrid.
}
