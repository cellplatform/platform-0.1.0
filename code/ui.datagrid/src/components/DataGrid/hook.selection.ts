import { Grid } from '../../api';

/**
 * Factory for creating a grid's `afterSelection` handler.
 *
 * See:
 *   - https://handsontable.com/docs/6.2.2/Hooks.html#event:afterSelection
 *
 */
export function afterSelectionHandler(getGrid: () => Grid) {
  return (
    row1: number,
    column1: number,
    row2: number,
    column2: number,
    preventScrolling: { value?: boolean },
    selectionLayerLevel: number,
  ) => {
    const grid = getGrid();
    const selection = grid.selection;
    grid.next({
      type: 'GRID/selection',
      payload: { selection, grid },
    });
  };
}
