import { alpha } from '../alpha';
import { parser } from '../parser';
import { t, defaultValue } from '../common';

type ICellCoord = { column?: number; row?: number };
type ICellKeyObject = { key: string };
type CellInput = string | number | ICellCoord | ICellKeyObject;

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
 * Converts various input types to a cell data-type.
 */
export function toCell(input: CellInput, options: { relative?: boolean } = {}): t.ICoordCell {
  let key = '';
  let column = -1;
  let row = -1;

  // Wrangle input into values.
  if (typeof input === 'object') {
    const keys = Object.keys(input);
    if (keys.includes('key')) {
      //
      // Type: { key }.
      //
      const obj = input as ICellKeyObject;
      key = obj.key;
      const pos = fromKey(key);
      row = pos.row;
      column = pos.column;
    } else if (keys.includes('row') || keys.includes('column')) {
      //
      // Type: { row, column }.
      //
      const obj = input as ICellCoord;
      key = toKey(obj.column, obj.row);
      column = obj.column === undefined ? -1 : obj.column;
      row = obj.row === undefined ? -1 : obj.row;
    } else {
      throw new Error(`Could not derive coord position for cell input. ${JSON.stringify(input)}`);
    }
  } else {
    //
    // Type: string/number.
    //
    key = typeof input === 'number' ? (input + 1).toString() : input;
    const pos = fromKey(key);
    row = pos.row;
    column = pos.column;
  }

  // Strip absolute "$" characters (if required).
  key = options.relative ? toRelative(key) : key;

  // Finish up.
  return { key, row, column };
}

/**
 * Strip absolute "$" characters.
 */
export function toRelative(key: string): string {
  return typeof key === 'string' ? key.replace(/\$/g, '') : key;
}

/**
 * Attempts to parse the given cell key.
 */
export function fromKey(key: string | number): t.ICoord {
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
 * Converts a cell-key into it's corresponding COLUMN part (eg "A1" => "A").
 */
export function toColumnKey(input: CellInput) {
  const cell = toCell(input);
  return cell.column === -1 ? '' : cell.row === -1 ? cell.key : toKey(cell.column, undefined);
}

/**
 * Converts a cell-key into it's corresponding ROW part (eg "A1" => "1").
 */
export function toRowKey(input: CellInput) {
  const cell = toCell(input);
  return cell.row === -1 ? '' : cell.column === -1 ? cell.key : toKey(undefined, cell.row);
}

/**
 * Converts a cell-key into it's corresponding COLUMN range (eg. "A3" => "A:A").
 */
export function toColumnRangeKey(input: CellInput) {
  const key = toColumnKey(input);
  return key ? `${key}:${key}` : '';
}

/**
 * Converts a cell-key into it's corresponding ROW range (eg. "A3" => "3:3").
 */
export function toRowRangeKey(input: CellInput) {
  const key = toRowKey(input);
  return key ? `${key}:${key}` : '';
}

/**
 * Converts the given key to a type.
 */
export function toType(cell: CellInput): t.CoordCellType | undefined {
  const type = typeof cell;

  if (!['string', 'number', 'object'].includes(type)) {
    return undefined;
  }

  const coord = type === 'object' ? (cell as t.ICoord) : fromKey(cell.toString());
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

/**
 * A cell sorter comparison.
 */
export const compare = {
  by: (axis: 'COLUMN' | 'ROW') => (axis === 'COLUMN' ? compare.byColumn : compare.byRow),
  byColumn: (a: CellInput, b: CellInput) => comparer(a, b, { axis: 'COLUMN' }),
  byRow: (a: CellInput, b: CellInput) => comparer(a, b, { axis: 'ROW' }),
};

export function comparer<T extends CellInput>(
  left: T,
  right: T,
  options: { axis?: 'COLUMN' | 'ROW' } = {},
): -1 | 0 | 1 {
  const { axis: by = 'COLUMN' } = options;
  const a = toCell(left);
  const b = toCell(right);

  if (a.key === b.key) {
    return 0;
  }

  if (by === 'COLUMN') {
    // Keys sorted by column, then row.
    const cols = compareNumber(a.column, b.column);
    return cols === 0 ? compareNumber(a.row, b.row) : cols;
  }

  if (by === 'ROW') {
    // Keys sorted by row, then column.
    const rows = compareNumber(a.row, b.row);
    return rows === 0 ? compareNumber(a.column, b.column) : rows;
  }

  throw new Error(`Sort by '${by}' not supported.`);
}
const compareNumber = (a: number, b: number) => (a === b ? 0 : a < b ? -1 : 1);

/**
 * Sorts a list of cells.
 */
export function sort<T extends CellInput>(list: T[], options: { by?: 'COLUMN' | 'ROW' } = {}) {
  const axis = options.by || 'COLUMN';
  return [...list].sort(compare.by(axis));
}
