import { coord, util } from './libs';
import * as t from './types';

/**
 * Create a clipboard object.
 */
export function toClipboard(args: { grid: t.IGrid; action: t.GridClipboardReadCommand }) {
  const { grid, action } = args;
  const cells = grid.selectionValues;
  const selection = grid.selection;

  // Process the set of selected values.
  const items = Object.keys(cells).map(key => {
    let item = cells[key] as t.IGridCellData;
    item = typeof item !== 'object' ? { value: item } : item;
    if (typeof item.value === 'string') {
      item.value = util.removeMarkdownEncoding(item.value);
    }
    return { key, item };
  });

  // Produce a tab-delimited string from the table.
  const text = coord.table.toString({
    delimiter: '\t',
    items: items.map(({ key, item }) => {
      const value = item.value ? item.value.toString() : '';
      return { key, value };
    }),
  });

  // Prepare payload.
  const columns = getAxisData('COLUMN', selection, grid.columns);
  const rows = getAxisData('ROW', selection, grid.rows);
  const payload: t.IGridClipboard<t.GridClipboardReadCommand> = {
    action,
    selection,
    text,
    cells,
    columns,
    rows,
  };

  // Finish up.
  return payload;
}

/**
 * [Helpers]
 */

function getAxisData<T extends t.IGridRows | t.IGridColumns>(
  axis: coord.CoordAxis,
  selection: t.IGridSelection,
  data: T,
): T {
  return selection.ranges.reduce((acc, next) => {
    if (coord.cell.isAxisRangeKey(next, axis)) {
      const range = coord.range.fromKey(next);
      range.axis(axis).keys.forEach(key => {
        if (data[key]) {
          acc[key] = data[key];
        }
      });
    }
    return acc;
  }, {}) as T;
}
