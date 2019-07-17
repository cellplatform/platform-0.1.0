import { cell } from '../cell';
import { t, defaultValue } from '../common';

type Axis = 'row' | 'column';
type TableItem<V = any> = { key: string; value: V; column: number; row: number };
type IInsertArgs = {
  table: t.IGridTable;
  index: number;
  total?: number;
  emptyValue?: any; // The empty value that inserted cells are replaced with.
};
type IRemoveArgs = {
  table: t.IGridTable;
  index: number;
  total?: number;
};

/**
 * Inserts column/row(s) into a table
 */
export const insert = {
  /**
   * Insert a column(s) into a table
   */
  column(args: IInsertArgs) {
    return shiftInsert({ ...args, axis: 'column' });
  },

  /**
   * Insert a row(s) into a table
   */
  row(args: IInsertArgs) {
    return shiftInsert({ ...args, axis: 'row' });
  },
};
function shiftInsert(args: IInsertArgs & { axis: Axis }) {
  const { axis, table, index, emptyValue } = args;
  const by = Math.max(0, defaultValue(args.total, 1));
  return by < 1 ? table : shift({ index, by, axis, table, emptyValue });
}

/**
 * Removes column/row(s) from a table.
 */
export const remove = {
  column(args: IRemoveArgs) {
    return shiftRemove({ ...args, axis: 'column' });
  },
  row(args: IRemoveArgs) {
    return shiftRemove({ ...args, axis: 'row' });
  },
};
function shiftRemove(args: IInsertArgs & { axis: Axis }) {
  const { axis, table, emptyValue } = args;
  const total = Math.max(0, defaultValue(args.total, 1));
  const index = args.index + total;
  const by = 0 - total;
  return total < 1 ? table : shift({ index, by, axis, table, emptyValue });
}

/**
 * Shifts the given row/column in a table.
 */
export function shift(args: {
  axis: Axis;
  table: t.IGridTable;
  index: number;
  by: number;
  emptyValue?: any; // The empty value that inserts are replaced with.
}): t.IGridTable {
  const result: t.IGridTable = {};
  const { axis, table, by } = args;

  // console.log('\nindex', args.index);
  // console.log('by', by);
  // console.log();

  if (args.index < 0) {
    throw new Error(`Index must be >= 0`);
  }
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
    before: items.filter(item => item[axis] < args.index),
    after: items.filter(item => item[axis] >= args.index),
  };

  // console.log('before', SET.before.map(item => item.key));
  // console.log('after', SET.after.map(item => item.key));

  // Write all shifted values to the table as "empty".
  SET.after.forEach(item => {
    const index = item[axis];
    const column = axis === 'column' ? index : item.column;
    const row = axis === 'row' ? index : item.row;
    const key = cell.toKey(column, row);
    result[key] = args.emptyValue;
  });

  // Overwrite all shifted values with the new key/value after the shift.
  SET.after.forEach(item => {
    const index = item[axis] + by;
    const column = axis === 'column' ? index : item.column;
    const row = axis === 'row' ? index : item.row;
    const key = cell.toKey(column, row);
    result[key] = item.value;
  });

  // Finish up.
  const before = SET.before.reduce((acc, next) => ({ ...acc, [next.key]: next.value }), {});
  return { ...before, ...result };
}
