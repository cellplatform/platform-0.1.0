import { Grid } from '../../api';
import { t } from '../../common';

/**
 * Factory for creating a grid's `afterSelection` handler.
 *
 * See:
 *   - https://handsontable.com/docs/6.2.2/Hooks.html#event:afterSelection
 *
 */
export function afterSelectionHandler(getGrid: () => Grid) {
  let from: t.IGridSelection = { cell: undefined, ranges: [] };

  const afterSelection = (
    row1: number,
    column1: number,
    row2: number,
    column2: number,
    preventScrolling: { value?: boolean },
    selectionLayerLevel: number,
  ) => {
    const grid = getGrid();
    const to = grid.selection;
    grid.fire({
      type: 'GRID/selection',
      payload: { from, to, grid },
    });
    from = { ...to };
  };

  const afterDeselect = () => {
    const grid = getGrid();
    const to = grid.selection;
    grid.fire({
      type: 'GRID/selection',
      payload: { from, to, grid },
    });
    from = { ...to };
  };

  return { afterSelection, afterDeselect };
}
