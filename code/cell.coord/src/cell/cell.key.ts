import { alpha } from '../alpha';
import { parser } from '../parser';
import { t, defaultValue, MemoryCache } from '../common';

type IRowCol = { column?: number; row?: number; ns?: string };
type IKeyObject = { key: string; ns?: string };
export type CellInput = string | number | IRowCol | IKeyObject;

const cache = MemoryCache.create();
const parse = (input: string | number) => {
  return cache.get(`parse/${input}`, () => {
    const parts = parser.toParts((input || '').toString());
    const ns = parts.ns;
    const key = parts.key;
    const row = parts.row.index;
    const column = parts.column.index;
    const res: t.ICoord = { row, column, key, ns };
    return res;
  });
};

/**
 * Converts indexes into alpha-numeric cell code.
 *  eg:
 *    -  0,0  => A1  (CELL)
 *    - -1,0  => A   (COLUMN)
 *    -  0,-1 => 1   (ROW)
 */
export function toKey(column?: number, row?: number): string {
  return cache.get(`toKey/${column}:${row}`, () => {
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
  });
}

/**
 * Converts various input types to a cell data-type.
 */
export function toCell(input: CellInput, options: { relative?: boolean } = {}): t.ICoord {
  let key = '';
  let ns = '';
  let column = -1;
  let row = -1;

  // Wrangle input into values.
  if (typeof input === 'object') {
    const keys = Object.keys(input);
    if (keys.includes('key') && typeof (input as IKeyObject).key === 'string') {
      //
      // Type: { key }.
      //
      const obj = input as IKeyObject;
      key = obj.key;
      ns = typeof obj.ns === 'string' ? obj.ns : ns;
      const pos = fromKey(key);
      row = pos.row;
      column = pos.column;
    } else if (keys.includes('row') || keys.includes('column')) {
      //
      // Type: { row, column }.
      //
      const obj = input as IRowCol;
      key = toKey(obj.column, obj.row);
      ns = typeof obj.ns === 'string' ? obj.ns : ns;
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
    const parts = parse(key);
    row = parts.row;
    column = parts.column;
    ns = parts.ns ? parts.ns : ns;
    key = parts.key;
  }

  // Strip absolute "$" characters (if required).
  key = options.relative ? toRelative(key) : key;

  // Ensure the key is uppercase.
  key = key.toUpperCase();

  // Clean up namespace.
  if (ns) {
    ns = ns.trim().replace(/!$/, '');
  }

  // Finish up.
  return { key, ns, row, column };
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
export function fromKey(key: string | number): t.ICoordPosition {
  const { row, column } = parse(key);
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
  if (parts.some((part) => !part.trim() || part.trim().length < part.length)) {
    return false;
  }
  return true;
}

/**
 * Determine if the key is an axis range (eg. "A:B" or "1:1").
 */
export function isAxisRangeKey(key: string, axis?: t.CoordAxis) {
  const type = axisRangeType(key);
  return axis ? type === axis : type !== undefined;
}

export function isColumnRangeKey(key: string) {
  return axisRangeType(key) === 'COLUMN';
}

export function isRowRangeKey(key: string) {
  return axisRangeType(key) === 'ROW';
}

export function axisRangeType(key: string): t.CoordAxis | undefined {
  const parts = (key || '')
    .trim()
    .split(':')
    .map((part) => part.trim());
  if (parts.length === 2) {
    const left = toType(parts[0]);
    const right = toType(parts[1]);
    if (left === right && (left === 'COLUMN' || left === 'ROW')) {
      return left;
    }
  }
  return undefined;
}

/**
 * Converts a cell input into the index number for the given axis.
 * eg:
 *    COLUMN: "A3" => 0
 *    ROW:    "A3" => 2
 */
export function toAxisIndex(axis: t.CoordAxis, input: CellInput) {
  const cell = toCell(input);
  switch (axis) {
    case 'COLUMN':
      return cell.column;
    case 'ROW':
      return cell.row;
    default:
      throw new Error(`Axis '${axis}' not supported.`);
  }
}

/**
 * Converts a cell input into it's corresponding COLUMN index (eg "A3" => 0).
 */
export function toColumnIndex(input: CellInput) {
  return toAxisIndex('COLUMN', input);
}

/**
 * Converts a cell input into it's corresponding ROW index (eg "A3" => 2).
 */
export function toRowIndex(input: CellInput) {
  return toAxisIndex('ROW', input);
}

/**
 * Converts a cell input into it's corresponding axis (COLUMN/ROW),
 * eg
 *    COLUMN: "A1" => "A"
 *    ROW:    "A1" => "1"
 */
export function toAxisKey(axis: t.CoordAxis, input: CellInput) {
  switch (axis) {
    case 'COLUMN':
      return toColumnKey(input);
    case 'ROW':
      return toRowKey(input);
    default:
      throw new Error(`Axis '${axis}' not supported.`);
  }
}

/**
 * Converts a cell input into it's corresponding COLUMN part (eg "A1" => "A").
 */
export function toColumnKey(input: CellInput) {
  if (typeof input === 'number') {
    return alpha.toCharacter(input);
  } else {
    const cell = toCell(input);
    return cell.column === -1 ? '' : cell.row === -1 ? cell.key : toKey(cell.column, undefined);
  }
}

/**
 * Converts a cell input into it's corresponding ROW part (eg "A1" => "1").
 */
export function toRowKey(input: CellInput) {
  const cell = toCell(input);
  return cell.row === -1 ? '' : cell.column === -1 ? cell.key : toKey(undefined, cell.row);
}

/**
 * Converts a cell input into it's corresponding COLUMN/ROW range
 * eg
 *    COLUMN: "A3" => "A:A"
 *    ROW:    "A3" => "3:3"
 *
 */
export function toAxisRangeKey(axis: t.CoordAxis, input: CellInput) {
  switch (axis) {
    case 'COLUMN':
      return toColumnRangeKey(input);
    case 'ROW':
      return toRowRangeKey(input);
    default:
      throw new Error(`Axis '${axis}' not supported.`);
  }
}

/**
 * Converts a cell input into it's corresponding COLUMN range (eg. "A3" => "A:A").
 */
export function toColumnRangeKey(input: CellInput) {
  const key = toColumnKey(input);
  return key ? `${key}:${key}` : '';
}

/**
 * Converts a cell input into it's corresponding ROW range (eg. "A3" => "3:3").
 */
export function toRowRangeKey(input: CellInput) {
  const key = toRowKey(input);
  return key ? `${key}:${key}` : '';
}

/**
 * Determines if the key represents a cell (eg "A1").
 */
export function isCell(input: CellInput) {
  return toType(input) === 'CELL';
}

/**
 * Determines if the key represents a column (eg "A").
 */
export function isColumn(input: CellInput) {
  return toType(input) === 'COLUMN';
}

/**
 * Determines if the key represents a row (eg "1").
 */
export function isRow(input: CellInput) {
  return toType(input) === 'ROW';
}

/**
 * Converts the given key to a type.
 */
export function toType(input: CellInput): t.CoordType | undefined {
  const cell = input as t.ICoord;
  const type = typeof cell;

  if (!['string', 'number', 'object'].includes(type)) {
    return undefined;
  }

  const coord =
    type === 'object' ? (cell.key ? fromKey(cell.key) : cell) : fromKey(cell.toString());
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
 * Result:
 *    1: greater-than
 *    0: same
 *   -1: less-than
 */
export const compare = {
  by: (axis: t.CoordAxis) => (axis === 'COLUMN' ? compare.byColumn : compare.byRow),
  byColumn: (a: CellInput, b: CellInput) => comparer(a, b, { axis: 'COLUMN' }),
  byRow: (a: CellInput, b: CellInput) => comparer(a, b, { axis: 'ROW' }),
};

export function comparer<T extends CellInput>(
  left: T,
  right: T,
  options: { axis?: t.CoordAxis } = {},
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
export function sort<T extends CellInput>(list: T[], options: { by?: t.CoordAxis } = {}) {
  const axis = options.by || 'COLUMN';
  return [...list].sort(compare.by(axis));
}

/**
 * Min cell (index).
 */
export const min = {
  by: (axis: t.CoordAxis, list: CellInput[]) => {
    let res: t.ICoord | undefined;
    list.forEach((item) => {
      const cell = toCell(item);
      res = !res ? cell : comparer(cell, res, { axis }) < 0 ? cell : res;
    });
    return res ? toAxisIndex(axis, res) : -1;
  },
  row: (list: CellInput[]) => min.by('ROW', list),
  column: (list: CellInput[]) => min.by('COLUMN', list),
};

/**
 * Max cell (index).
 */
export const max = {
  by: (axis: t.CoordAxis, list: CellInput[]) => {
    let res: t.ICoord | undefined;
    list.forEach((item) => {
      const cell = toCell(item);
      res = !res ? cell : comparer(cell, res, { axis }) > 0 ? cell : res;
    });
    return res ? toAxisIndex(axis, res) : -1;
  },
  row: (list: CellInput[]) => max.by('ROW', list),
  column: (list: CellInput[]) => max.by('COLUMN', list),
};
