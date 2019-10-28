import { Grid } from '../../api';
import { t, coord } from '../common';

/**
 * Handles bubbling mouse events.
 *  - https://handsontable.com/docs/6.2.2/Hooks.html
 */
export function undo(grid: Grid, stage: 'BEFORE' | 'AFTER', kind: t.IGridUndo['kind']) {
  return function(action: any) {
    const { actionType } = action;
    if (stage === 'BEFORE' && actionType === 'change') {
      const changes = action.changes.map((item: any[]) => {
        const [row, column, from, to] = item;
        const key = coord.cell.toKey(column, row);
        const change: t.IGridUndoChange = { key, from, to };
        return change;
      });
      grid.fire({ type: 'GRID/undo', payload: { kind, changes } });
    }
  };
}
