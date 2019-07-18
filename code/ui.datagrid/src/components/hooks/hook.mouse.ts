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
  return function(e: MouseEvent, coords: { row: number; col: number }, td: Element) {
    const grid = getGrid();
    const { row, col: column } = coords;

    // Fire mouse event.
    const payload = toMousePayload(e, type, grid, column, row);
    if (payload) {
      grid.fire({ type: 'GRID/mouse', payload });
    }

    // If the event-type is `UP` also fire the conceptual `CLICK` event
    // which is raised by the handsontable.
    if (payload && type === 'UP') {
      grid.fire({
        type: 'GRID/mouse',
        payload: toMousePayload(e, 'CLICK', grid, column, row) as t.IGridMouse,
      });
    }
  } as any; // HACK: TS types on handsongrid.
}

/**
 * [Helpers]
 */

function toMousePayload(
  e: MouseEvent,
  type: t.IGridMouse['type'],
  grid: Grid,
  column: number,
  row: number,
): t.IGridMouse | undefined {
  const cell = cellUtil.cell.toKey(column, row);
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
    button: e.button === 2 ? 'RIGHT' : 'LEFT',
    grid,
    type,
    isCancelled: false,
    cancel: () => {
      e.preventDefault();
      e.stopImmediatePropagation();
      payload.isCancelled = true;
    },
  };

  return payload;
}
