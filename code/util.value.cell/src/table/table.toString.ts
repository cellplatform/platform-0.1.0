import { cell } from '../cell';
import { range } from '../range';
import { R } from '../common';

type Item = { key: string; value: any };
type ItemCell = Item & { column: number; row: number };

/**
 * Converts a list of items to a string table of rows (CSV/TSV).
 */
export function toString(args: { items: Item[]; delimiter?: string }) {
  if (typeof args !== 'object') {
    // Prevent error if no args supplied.
    // NB:  This should only happen if some other process calls
    //      calls toString on the module by default.
    return '[Table]';
  }
  if (args.items.length === 0) {
    return '';
  }
  const { delimiter = '\t' } = args;

  // Clean up incoming list (sort, unique)
  const items = R.uniqBy(R.prop('key'), cell.sort(args.items));

  // Get a complete square of keys as the given list by have holes in it.
  const square = range.fromKey(`${items[0].key}:${items[items.length - 1].key}`).square;
  const list: ItemCell[] = square.keys.map(key => {
    let item = items.find(item => item.key === key);
    item = item ? item : { key, value: undefined };
    const { column, row } = cell.fromKey(key);
    return { ...item, column, row };
  });

  // Convert the sorted list into distinct rows.
  let row = -1;
  const rows = cell.sort(list, { by: 'ROW' }).reduce(
    (acc, next) => {
      if (row !== next.row) {
        row = next.row;
        acc.push([]); // Next row.
      }
      acc[acc.length - 1].push(next);
      return acc;
    },
    [] as ItemCell[][],
  );

  // Collapse into string.
  const text = rows.reduce((acc, next, i) => {
    const line = next.map(m => m.value).join(delimiter);
    const newline = i === 0 ? '' : '\n';
    return `${acc}${newline}${line}`;
  }, '');

  return text;
}
