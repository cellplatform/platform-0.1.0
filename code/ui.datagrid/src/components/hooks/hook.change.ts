import { Grid } from '../../api';
import { t, R } from '../../common';
import { TableEventSource } from '../DataGrid/types.private';

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

    const modify = (index: number, value: t.CellValue) => {
      if (Array.isArray(sourceChanges[index])) {
        const change = [...(sourceChanges[index] as any[])];
        change[3] = value;
        sourceChanges[index] = change as any;
      }
    };

    // Convert all changes that are to the value  [null] to be [undefined].
    //    NB: [undefined] is the primary value for "nothing".
    //    Transforming [null] here prevents the grid from rendering
    //    the next "null".
    sourceChanges.forEach((item, i) => {
      if (Array.isArray(item) && item[3] === null) {
        modify(i, undefined);
      }
    });

    // Prepare individual change events.
    const changes = sourceChanges
      .map((change, i) => {
        if (!change) {
          return;
        }
        const row = change[0] as number;
        const column = change[1] as number;
        const value = { from: change[2], to: change[3] };
        const isChanged = !R.equals(value.from, value.to);
        const payload: t.IGridCellChange = {
          source: toSource(source),
          grid,
          get cell() {
            return grid.cell({ row, column });
          },
          value,
          isChanged,
          isCancelled: false,
          isModified: false,
          cancel() {
            payload.isCancelled = true;
            sourceChanges[i] = null;
          },
          modify(value: t.CellValue) {
            modify(i, value);
            payload.isModified = true;
          },
        };
        return payload;
      })
      .filter(e => Boolean(e))
      .map(e => e as t.IGridCellChange)
      .filter(e => e.isChanged);

    // Fire change events.
    changes.forEach(payload => grid.fire({ type: 'GRID/cell/change', payload }));

    // Fire changes as a set.
    if (changes.length > 0) {
      grid.fire({
        type: 'GRID/cell/change/set',
        payload: {
          changes,
          cancel: () => changes.forEach(change => change.cancel()),
        },
      });
    }
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
