import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { coord, removeMarkdownEncoding, t } from '../common';

type ClipboardItem = {
  key: string;
  value?: t.IGridCell | t.IGridRow | t.IGridColumn;
};

const CLIPBOARD: t.GridClipboardCommand[] = ['CUT', 'COPY', 'PASTE'];
let PENDING: t.IGridClipboard | undefined;

console.log(`\nTODO 🐷  move PENDING state to IGrid state \n`)

/**
 * Manage clipboard commands.
 */
export function init(args: {
  grid: t.IGrid;
  command$: Observable<t.IGridCommand>;
  fire: t.FireGridEvent;
}) {
  const { grid, command$, fire } = args;
  const clipboard$ = command$.pipe(
    filter(e => CLIPBOARD.includes(e.command as any)),
    filter(e => !e.isCancelled),
    map(e => e.command),
  );
  clipboard$.pipe(filter(e => e === 'CUT')).subscribe(e => read({ grid, fire, action: 'CUT' }));
  clipboard$.pipe(filter(e => e === 'COPY')).subscribe(e => read({ grid, fire, action: 'COPY' }));
  clipboard$.pipe(filter(e => e === 'PASTE')).subscribe(e => write({ grid, fire }));
}

/**
 * Read from the clipboard.
 */
async function read(args: { grid: t.IGrid; action: 'CUT' | 'COPY'; fire: t.FireGridEvent }) {
  const { grid, action } = args;
  const cells = grid.selectionValues;
  const selection = grid.selection;

  // Process the set of selected values.
  const items = Object.keys(cells).map(key => {
    let item = cells[key] as t.IGridCell;
    item = typeof item !== 'object' ? { value: item } : item;
    if (typeof item.value === 'string') {
      item.value = removeMarkdownEncoding(item.value);
    }
    return { key, item };
  });

  if (items.length === 0) {
    return;
  }

  // Produce a tab-delimited string from the table.
  const text = coord.table.toString({
    delimiter: '\t',
    items: items.map(({ key, item }) => {
      const value = item.value ? item.value.toString() : '';
      return { key, value };
    }),
  });

  // Send text to clipboard.
  await navigator.clipboard.writeText(text);

  // Store data if full ROWs or COLUMNs are selected.
  const columns = getAxisData('COLUMN', selection, grid.columns);
  const rows = getAxisData('ROW', selection, grid.rows);

  // Alert listeners and store state.
  const range = coord.range.square(items.map(item => item.key)).key;
  const payload: t.IGridClipboard = { action, range, selection, text, cells, columns, rows };
  PENDING = payload;
  args.fire({ type: 'GRID/clipboard', payload });
}

/**
 * Write to the clipboard.
 */
async function write(args: { grid: t.IGrid; fire: t.FireGridEvent }) {
  const { grid } = args;
  const selection = grid.selection;
  const targetCell = selection.cell;
  if (!targetCell) {
    return;
  }
  let redraw = false;

  // Read text from clipboard.
  const text = await navigator.clipboard.readText();

  // Determine if the clipboard text is the same as the in-memory pending object.
  const isPendingLatest = PENDING ? PENDING.text === text : false;
  if (!isPendingLatest) {
    PENDING = undefined;
  }
  const pending = PENDING;

  // Delete data if pending "cut" operation.
  if (pending && pending.action === 'CUT') {
    const range = coord.range.fromKey(pending.range);
    const empty = range.keys.reduce((acc, key) => {
      acc[key] = { value: undefined };
      return acc;
    }, {});
    grid.changeCells(empty, { source: 'CLIPBOARD/cut' });
  }

  // Convert text to table items.
  const cellsFromString = (): ClipboardItem[] =>
    coord.table
      .fromString({ key: targetCell, text })
      .map(({ key, value }) => ({ key, value: { value } }));

  // Derive the list of clipboard items.
  const items = pending
    ? shiftCells({ targetCell, range: pending.range, data: pending.cells })
    : cellsFromString();
  if (items.length === 0) {
    return;
  }

  // Update cells.
  const changedCells = items.reduce((acc, next) => {
    acc[next.key] = next.value;
    return acc;
  }, {});
  grid.changeCells(changedCells, { source: 'CLIPBOARD/paste' });

  // Update row/column data.
  const shiftedAxisData = <T extends t.IGridRows | t.IGridColumns>(
    axis: coord.CoordAxis,
    data: T,
  ): T => {
    if (!pending || Object.keys(data).length === 0) {
      return {} as any;
    }
    const source = firstAxisRange(axis, pending.selection);
    const target = firstAxisRange(axis, selection);
    if (!source || !target) {
      return {} as any;
    }
    return shiftAxisData<T>({ axis, source, target, data });
  };
  const columns = pending ? shiftedAxisData('COLUMN', pending.columns) : {};
  const rows = pending ? shiftedAxisData('ROW', pending.rows) : {};
  if (Object.keys(columns).length > 0) {
    grid.changeColumns(columns, { source: 'CLIPBOARD/paste' });
    redraw = true;
  }
  if (Object.keys(rows).length > 0) {
    grid.changeRows(rows, { source: 'CLIPBOARD/paste' });
    redraw = true;
  }

  // Update grid selection.
  const square = coord.range.square(items.map(item => item.key));
  grid.select({ cell: square.left.key, ranges: [square.key] });

  // Alert listeners.
  const cells = items.reduce((acc, next) => {
    acc[next.key] = next.value;
    return acc;
  }, {});

  args.fire({
    type: 'GRID/clipboard',
    payload: { action: 'PASTE', range: square.key, selection, text, cells, columns, rows },
  });

  // Finish up.
  if (redraw) {
    grid.redraw();
  }
}

/**
 * [Helpers]
 */
function shiftCells(args: {
  targetCell: string;
  range: string;
  data: t.IGridValues;
}): ClipboardItem[] {
  const range = coord.range.fromKey(args.range);
  const pos = {
    start: coord.cell.fromKey(range.left.key),
    end: coord.cell.fromKey(args.targetCell),
  };
  const diff = {
    row: pos.end.row - pos.start.row,
    column: pos.end.column - pos.start.column,
  };

  const data = { ...args.data };
  return Object.keys(data).map(cell => {
    const pos = coord.cell.fromKey(cell);
    const key = coord.cell.toKey(pos.column + diff.column, pos.row + diff.row);
    return { key, value: data[cell] };
  });
}

function shiftAxisData<T extends t.IGridRows | t.IGridColumns>(args: {
  axis: coord.CoordAxis;
  source: coord.range.CellRange;
  target: coord.range.CellRange;
  data: T;
}): T {
  const { axis } = args;
  const pos = {
    start: args.source.left,
    end: args.target.left,
  };
  const diff = coord.cell.toAxisIndex(axis, pos.end) - coord.cell.toAxisIndex(axis, pos.start);
  const data = { ...args.data };
  return Object.keys(data).reduce((acc, next) => {
    const index = coord.cell.toAxisIndex(axis, next) + diff;
    const key = coord.cell.toAxisKey(axis, index);
    if (key) {
      acc[key] = data[next];
    }
    return acc;
  }, {}) as T;
}

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

function firstAxisRange(axis: coord.CoordAxis, selection: t.IGridSelection) {
  const key = selection.ranges.find(key => coord.cell.isAxisRangeKey(key, axis));
  return key ? coord.range.fromKey(key) : undefined;
}
