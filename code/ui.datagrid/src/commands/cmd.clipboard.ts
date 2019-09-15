import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { coord, removeMarkdownEncoding, t } from '../common';

const CLIPBOARD: t.GridClipboardCommand[] = ['CUT', 'COPY', 'PASTE'];
let PENDING: t.IGridClipboard | undefined;

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
  clipboard$.pipe(filter(e => e === 'CUT')).subscribe(e => read({ action: 'CUT', grid, fire }));
  clipboard$.pipe(filter(e => e === 'COPY')).subscribe(e => read({ action: 'COPY', grid, fire }));
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

  // Determine the top-left cell.
  console.log('items', items);
  const range = coord.range.square(items.map(item => item.key)).key;

  // Alert listeners and store state.
  const payload: t.IGridClipboard = { action, range, selection, text, cells };
  PENDING = payload;
  args.fire({ type: 'GRID/clipboard', payload });
}

/**
 * Write to the clipboard.
 */
async function write(args: { grid: t.IGrid; fire: t.FireGridEvent }) {
  const { grid } = args;
  const selection = grid.selection;
  const key = selection.cell;
  if (!key) {
    return;
  }

  // Read text from clipboard.
  const text = await navigator.clipboard.readText();

  // Determine if the clipboard text is the same as the in-memory pending object.
  const isPendingLatest = PENDING ? PENDING.text === text : false;
  if (!isPendingLatest) {
    PENDING = undefined;
  }

  // Delete data if pending "cut" operation.
  if (PENDING && PENDING.action === 'CUT') {
    const range = coord.range.fromKey(PENDING.range);
    const empty = range.keys.reduce((acc, key) => {
      acc[key] = { value: undefined };
      return acc;
    }, {});
    grid.changeCells(empty, { source: 'CUT' });
  }

  type ClipboardItem = { key: string; value?: t.IGridCell };

  // Convert pending items (shifted to insertion point).
  const fromPending = (args: { range: string; cells: t.IGridValues }): ClipboardItem[] => {
    const range = coord.range.fromKey(args.range);
    const pos = {
      start: coord.cell.fromKey(range.left.key),
      end: coord.cell.fromKey(key),
    };
    const diff = {
      row: pos.end.row - pos.start.row,
      column: pos.end.column - pos.start.column,
    };

    const cells = { ...args.cells };
    return Object.keys(cells).map(cell => {
      const pos = coord.cell.fromKey(cell);
      const key = coord.cell.toKey(pos.column + diff.column, pos.row + diff.row);
      return { key, value: cells[cell] };
    });
  };

  // Convert text to table items.
  const fromString = (): ClipboardItem[] =>
    coord.table.fromString({ key, text }).map(({ key, value }) => ({ key, value: { value } }));

  // Derive the list of clipboard items.
  const items =
    PENDING && isPendingLatest
      ? fromPending({ range: PENDING.range, cells: PENDING.cells || {} })
      : fromString();

  if (items.length === 0) {
    return;
  }

  // Update change.
  const changes = items.reduce((acc, next) => {
    acc[next.key] = next.value;
    return acc;
  }, {});
  grid.changeCells(changes, { source: 'PASTE' });

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
    payload: { action: 'PASTE', range: square.key, selection, text, cells },
  });
}
