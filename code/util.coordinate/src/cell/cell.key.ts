import { toAlphaCharacter } from '../common';

/**
 * Converts indexes into alpha-numeric cell code.
 *  eg:
 *    -  0,0  => A1  (CELL)
 *    - -1,0  => A   (COLUMN)
 *    -  0,-1 => 1   (ROW)
 */
export function toCellKey(column?: number, row?: number) {
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
    const char = toAlphaCharacter(cell.column);
    result = `${char}`;
  } else {
    // CELL
    result = `${toAlphaCharacter(cell.column)}${cell.row + 1}`;
  }

  // Finish up.
  return result;
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
