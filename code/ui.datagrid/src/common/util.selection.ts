import * as t from './types';
import { coord, R } from './libs';

/**
 * Retrieves the grid values that map to the given selection.
 */
export function toSelectionValues(args: {
  values: t.IGridValues;
  selection: t.IGridSelection;
}): t.IGridValues {
  const { values, selection } = args;
  if (selection.all) {
    return values;
  }

  // Add focused cell value.
  const res: t.IGridValues = {};
  if (selection.cell) {
    res[selection.cell] = values[selection.cell];
  }

  // Add values from ranges.
  const filterAxisRange = (
    field: 'column' | 'row',
    start: number,
    end: number,
    coords: coord.ICoordCell[],
  ) => {
    return coords.filter(cell => cell[field] >= start && cell[field] <= end).map(cell => cell.key);
  };

  let keys: string[] = [];
  const all = Object.keys(values).map(key => coord.cell.toCell(key));
  coord.range.union(selection.ranges).ranges.forEach(range => {
    if (coord.cell.isColumnRangeKey(range.key)) {
      keys = [...keys, ...filterAxisRange('column', range.left.column, range.right.column, all)];
    } else if (coord.cell.isRowRangeKey(range.key)) {
      keys = [...keys, ...filterAxisRange('row', range.left.row, range.right.row, all)];
    } else {
      keys = [...keys, ...range.keys];
    }
  });

  // Construct return object.
  return R.uniq(keys).reduce((acc, key) => {
    const value = values[key] || { value: undefined };
    acc[key] = value;
    return acc;
  }, res);
}
