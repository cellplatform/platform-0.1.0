import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { coord, t, toClipboard } from '../common';

type ClipboardItem = {
  key: string;
  value?: t.IGridCellData | t.IGridRowData | t.IGridColumnData;
};

const CLIPBOARD_COMMANDS: t.GridClipboardCommand[] = ['CUT', 'COPY', 'PASTE'];

/**
 * Manage clipboard commands.
 */
export function init(args: {
  grid: t.IGrid;
  command$: Observable<t.IGridCommand>;
  fire: t.GridFireEvent;
}) {
  const { grid, command$, fire } = args;
  const clipboard$ = command$.pipe(
    filter(e => CLIPBOARD_COMMANDS.includes(e.command as any)),
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
async function read(args: {
  grid: t.IGrid;
  action: t.GridClipboardReadCommand;
  fire: t.GridFireEvent;
}) {
  const { grid, action } = args;

  // Fire the BEFORE event, allowing any listeners to clean up the
  // dataset before the clipboard is copied.
  const wait: Array<Promise<any>> = [];
  args.fire({
    type: 'GRID/clipboard/before/read',
    payload: {
      action,
      wait: promise => wait.push(promise),
    },
  });
  if (wait.length > 0) {
    await Promise.all(wait);
  }

  // Prepare the clipboard state.
  const payload = toClipboard({ grid, action });

  // Send text to clipboard.
  await navigator.clipboard.writeText(payload.text);

  // Alert listeners and store state.
  grid.clipboard = { ...payload, pasted: 0 };
  args.fire({ type: 'GRID/clipboard', payload });
}

/**
 * Write to the clipboard.
 */
async function write(args: { grid: t.IGrid; fire: t.GridFireEvent }) {
  const { grid } = args;
  const selection = grid.selection;
  const targetCell = selection.cell;
  if (!targetCell) {
    return;
  }
  let redraw = false;

  // Read text from clipboard.
  const text = await navigator.clipboard.readText();

  // Fire PRE event.
  let pending = grid.clipboard;
  const before: t.IGridClipboardBeforePaste = {
    text,
    pending,
    isModified: false,
    modify: change => {
      before.isModified = true;
      pending = { ...(change || {}), pasted: 0 };
    },
  };
  args.fire({ type: 'GRID/clipboard/before/paste', payload: before });

  // Determine if the clipboard text is the same as the in-memory pending object.
  const isPendingCurrent = pending ? pending.text === text : false;
  if (!isPendingCurrent) {
    grid.clipboard = undefined; // Reset stored clipboard state if actual clipboard differs.
    pending = undefined;
  }

  // Delete data if pending is a "cut" operation.
  if (pending && pending.action === 'CUT') {
    const empty = Object.keys(pending.cells).reduce((acc, key) => {
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
  const items =
    pending && pending.selection.cell
      ? shiftCells({
          sourceCell: pending.selection.cell,
          targetCell,
          data: pending.cells,
        })
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
  const shiftedAxisData = <T extends t.IGridData['rows'] | t.IGridData['columns']>(
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

  // Increment the total pastes of this clipboard value in state.
  if (grid.clipboard) {
    grid.clipboard = { ...grid.clipboard, pasted: grid.clipboard.pasted + 1 };
  }

  // Alert listeners.
  const cells = items.reduce((acc, next) => {
    acc[next.key] = next.value;
    return acc;
  }, {});

  args.fire({
    type: 'GRID/clipboard',
    payload: { action: 'PASTE', selection, text, cells, columns, rows },
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
  sourceCell: string;
  targetCell: string;
  data: t.IGridData['cells'];
}): ClipboardItem[] {
  const pos = {
    start: coord.cell.fromKey(args.sourceCell),
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

function shiftAxisData<T extends t.IGridData['rows'] | t.IGridData['columns']>(args: {
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

function firstAxisRange(axis: coord.CoordAxis, selection: t.IGridSelection) {
  const key = selection.ranges.find(key => coord.cell.isAxisRangeKey(key, axis));
  return key ? coord.range.fromKey(key) : undefined;
}
