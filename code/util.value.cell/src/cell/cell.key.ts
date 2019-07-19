import { alpha } from '../alpha';
import { parser } from '../parser';
import { t, defaultValue } from '../common';

/**
 * Converts indexes into alpha-numeric cell code.
 *  eg:
 *    -  0,0  => A1  (CELL)
 *    - -1,0  => A   (COLUMN)
 *    -  0,-1 => 1   (ROW)
 */
export function toKey(column?: number, row?: number) {
  // Setup initial conditions.
  column = column === undefined ? -1 : column;
  row = row === undefined ? -1 : row;
  const cell = { column, row };
  let result: string | undefined;

  // Convert cell.
  if (cell.column <= -1 && cell.row <= -1) {
    // ALL (wild card)
    result = '*';
  } else if (cell.column <= -1) {
    // ROW
    result = `${cell.row + 1}`;
  } else if (cell.row <= -1) {
    // COLUMN
    const char = alpha.toCharacter(cell.column);
    result = `${char}`;
  } else {
    // CELL
    result = `${alpha.toCharacter(cell.column)}${cell.row + 1}`;
  }

  // Finish up.
  return result;
}

/**
 * Attempts to parse the given cell key.
 */
export function fromKey(key: string | number): t.IGridCellPosition {
  const parts = parser.toParts((key || '').toString());
  const row = parts.row.index;
  const column = parts.column.index;
  return { row, column };
}

/**
 * Determines whether the given key represents a range.
 */
export function isRangeKey(key: string) {
  const parts = key.trim().split(':');
  if (parts.length < 2) {
    return false;
  }
  if (parts.some(part => !part.trim() || part.trim().length < part.length)) {
    return false;
  }
  return true;
}

/**
 * Converts the given key to a type.
 */
export function toType(
  cell: string | number | { column?: number; row?: number },
): t.GridCellType | undefined {
  const type = typeof cell;

  if (!['string', 'number', 'object'].includes(type)) {
    return undefined;
  }

  const coord = type === 'object' ? (cell as t.IGridCellPosition) : fromKey(cell.toString());
  const column = defaultValue(coord.column, -1);
  const row = defaultValue(coord.row, -1);

  if (column < 0 && row < 0) {
    return undefined;
  }
  if (column >= 0 && row >= 0) {
    return 'CELL';
  }
  if (column >= 0) {
    return 'COLUMN';
  }
  if (row >= 0) {
    return 'ROW';
  }
  return undefined;
}
