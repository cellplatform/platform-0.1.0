import { cell } from '../cell';
import { t, defaultValue } from '../common';

type TableItem<V = any> = { key: string; value: V; column: number; row: number };

type IInsertArgs = {
  table: t.IGridTable;
  index: number;
  total?: number;
  emptyValue?: any; // The empty value that inserts are replaced with.
};

/**
 * Inserts a column into a table
 */
export function insertColumn(args: IInsertArgs) {
  return insert({ ...args, type: 'column' });
}

/**
 * Inserts a row into a table
 */
export function insertRow(args: IInsertArgs) {
  return insert({ ...args, type: 'row' });
}

/**
 * Inserts a row or column into a table.
 */
export function insert(args: { type: 'row' | 'column' } & IInsertArgs): t.IGridTable {
  const result: t.IGridTable = {};
  const { type, table } = args;
  const total = defaultValue(args.total, 1);

  if (args.index < 0) {
    throw new Error(`Index must be >= 0.`);
  }
  // if (total < 1) {
  //   return table;
  // }

  // Convert table to list.
  const items: TableItem[] = Object.keys(table).map(key => {
    const { row, column } = cell.fromKey(key);
    const value = table[key];
    return { key, value, row, column };
  });

  // Extract the set of cells before the insertion-point, and after the insertion-point.
  const set = {
    before: items.filter(item => item[type] < args.index),
    after: items.filter(item => item[type] >= args.index),
  };

  // Write all shifted values to the table as "empty".
  set.after.forEach(item => {
    const index = item[type];
    const column = type === 'column' ? index : item.column;
    const row = type === 'row' ? index : item.row;
    const key = cell.toKey(column, row);
    result[key] = args.emptyValue;
  });

  // Overwrite all shifted values with the new key/value after the shift.
  set.after.forEach(item => {
    const index = item[type] + total;
    const column = type === 'column' ? index : item.column;
    const row = type === 'row' ? index : item.row;
    const key = cell.toKey(column, row);
    result[key] = item.value;
  });

  // Finish up.
  const before = set.before.reduce((acc, next) => ({ ...acc, [next.key]: next.value }), {});
  return { ...before, ...result };
}
