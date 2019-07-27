import { cell } from '../cell';
import { t, defaultValue } from '../common';

type TableItem<V = any> = { key: string; value: V; column: number; row: number };
type IInsertArgs = {
  table: t.ICoordTable;
  index: number;
  total?: number;
  emptyValue?: any; // The empty value that inserted cells are replaced with.
};
type IRemoveArgs = {
  table: t.ICoordTable;
  index: number;
  total?: number;
};

/**
 * Inserts column/row(s) into a table
 */
export const insert = {
  column: (args: IInsertArgs) => insert.axis({ ...args, axis: 'COLUMN' }),
  row: (args: IInsertArgs) => insert.axis({ ...args, axis: 'ROW' }),
  axis(args: IInsertArgs & { axis: t.CoordAxis }) {
    const { axis, table, emptyValue } = args;
    const index = Math.max(0, args.index);
    const by = Math.max(0, defaultValue(args.total, 1));
    return by < 1 ? table : shift({ index, by, axis, table, emptyValue });
  },
};

/**
 * Removes column/row(s) from a table.
 */
export const remove = {
  column: (args: IRemoveArgs) => remove.axis({ ...args, axis: 'COLUMN' }),
  row: (args: IRemoveArgs) => remove.axis({ ...args, axis: 'ROW' }),
  axis(args: IRemoveArgs & { axis: t.CoordAxis }) {
    const { axis } = args;
    const total = Math.max(0, defaultValue(args.total, 1));
    let table = args.table;

    // Zero out items within the delete range.
    let index = Math.max(0, args.index);
    table = overwrite({ table, axis, from: index, to: index + total - 1 });

    // Shift cells into deleted space.
    index = index + total;
    const by = 0 - total;
    return total < 1 ? table : shift({ index, by, axis, table });
  },
};

/**
 * Shifts the given row/column in a table.
 */
export function shift(args: {
  axis: t.CoordAxis;
  table: t.ICoordTable;
  index: number;
  by: number;
  emptyValue?: any; // The empty value that inserts are replaced with.
}): t.ICoordTable {
  const result: t.ICoordTable = {};
  const { axis, table, by } = args;
  const field = axis.toLowerCase();

  if (by === 0) {
    return table; // No change.
  }

  // Convert table to list.
  const items: TableItem[] = Object.keys(table).map(key => {
    const { row, column } = cell.fromKey(key);
    const value = table[key];
    return { key, value, row, column };
  });

  // Extract the set of cells before the insertion-point, and after the insertion-point.
  const SET = {
    before: items.filter(item => item[field] < args.index),
    after: items.filter(item => item[field] >= args.index),
  };

  // Write all shifted values to the table as "empty".
  SET.after.forEach(item => {
    const index = item[field];
    const column = axis === 'COLUMN' ? index : item.column;
    const row = axis === 'ROW' ? index : item.row;
    const key = cell.toKey(column, row);
    result[key] = args.emptyValue;
  });

  // Overwrite all shifted values with the new key/value after the shift.
  SET.after.forEach(item => {
    const index = item[field] + by;
    const column = axis === 'COLUMN' ? index : item.column;
    const row = axis === 'ROW' ? index : item.row;
    const key = cell.toKey(column, row);
    result[key] = item.value;
  });

  // Finish up.
  const before = SET.before.reduce((acc, next) => {
    acc[next.key] = next.value;
    return acc;
  }, {});
  return { ...before, ...result };
}

/**
 * [Helpers]
 */

/**
 * Overrites the range of values
 */
function overwrite(args: {
  axis: t.CoordAxis;
  table: t.ICoordTable;
  from: number;
  to: number;
  value?: undefined;
}) {
  const { axis, table, from, to } = args;
  const field = axis.toLowerCase();

  const items: TableItem[] = Object.keys(table).map(key => {
    const { row, column } = cell.fromKey(key);
    const value = table[key];
    return { key, value, row, column };
  });

  const range = items.filter(item => {
    const index = item[field];
    return index >= from && index <= to;
  });

  const result: t.ICoordTable = { ...table };
  range.forEach(item => (result[item.key] = args.value));

  return result;
}
