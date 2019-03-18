import { Grid } from '../api';
import { t } from '../../common';
import { TableEventSource } from './types.private';

/**
 * Factory for creating a grid's `beforeChange` handler.
 *
 * See:
 *   - https://handsontable.com/docs/6.2.2/Hooks.html#event:beforeChange
 *
 */
export function beforeChangeHandler(getGrid: () => Grid) {
  return (sourceChanges: Array<[number, string | number, any, any] | null>, src: string) => {
    const grid = getGrid();
    const source = src as TableEventSource;

    // Prepare individual change events.
    const changes = sourceChanges
      .map((change, i) => {
        if (!change) {
          return;
        }
        const row = change[0] as number;
        const column = change[1] as number;
        const payload: t.IGridChange = {
          source: toSource(source),
          row,
          column,
          grid,
          get cell() {
            return grid.cell({ row, column });
          },
          value: { from: change[2], to: change[3] },
          isCancelled: false,
          cancel() {
            payload.isCancelled = true;
            sourceChanges[i] = null;
          },
        };
        return payload;
      })
      .filter(e => Boolean(e)) as t.IGridChange[];

    // Fire change events.
    changes.forEach(payload => grid.next({ type: 'GRID/change', payload }));

    // Fire changes as a set.
    grid.next({
      type: 'GRID/changeSet',
      payload: {
        changes,
        cancel: () => changes.forEach(change => change.cancel()),
      },
    });
  };
}

function toSource(source: TableEventSource): t.GridChangeType {
  switch (source) {
    case 'edit':
      return 'EDIT';

    default:
      return 'OTHER';
  }
}
