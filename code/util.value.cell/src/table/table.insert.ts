import { t, R } from '../common';
import { cell } from '../cell';

/**
 * Inserts a column into a table
 */
export function insertColumn(args: { table: t.IGridTable; index: number }) {
  return insert({ ...args, type: 'column' });
}

/**
 * Inserts a row into a table
 */
export function insertRow(args: { table: t.IGridTable; index: number }) {
  return insert({ ...args, type: 'row' });
}

/**
 * Inserts a row or column into a table.
 */

export function insert(args: {
  type: 'row' | 'column';
  table: t.IGridTable;
  index: number;
}): t.IGridTable {
  const { type, table } = args;
  if (args.index < 0) {
    throw new Error(`Index must be >= 0.`);
  }

  const items = Object.keys(table).map(key => {
    const { row, column } = cell.fromKey(key);
    const value = table[key];
    return { key, value, row, column };
  });

  const before = items.filter(item => item[type] < args.index);
  const after = R.sortWith(
    [R.descend(R.prop(type))],
    items.filter(item => item[type] >= args.index),
  ).map(item => {
    const index = item[type] + 1;
    const column = type === 'column' ? index : item.column;
    const row = type === 'row' ? index : item.row;
    const key = cell.toKey(column, row);
    return {
      ...item,
      [type]: index,
      key,
    };
  });

  // console.log('before', before);
  // console.log('-------------------------------------------');
  // console.log('after', after);

  return {
    ...before.reduce((acc, next) => ({ ...acc, [next.key]: next.value }), {}),
    ...after.reduce((acc, next) => ({ ...acc, [next.key]: next.value }), {}),
  };
}
