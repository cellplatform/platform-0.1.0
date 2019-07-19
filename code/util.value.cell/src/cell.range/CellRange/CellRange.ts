import { R, t, value as valueUtil } from '../../common';
// import * as util from '../util';
// import { CellUri, ICellUri } from '../CellUri';
import { parser } from '../../parser';
import { cell } from '../../cell';
import { alpha } from '../../alpha';

const URI_PREFIX = 'hri'; // TEMP 🐷

/**
 * Represents a range of cells.
 */
export class CellRange {
  /**
   * Create from key (eg: "A1:C4", "A:B", "2:99" etc).
   */
  public static fromKey = (key: string) => new CellRange({ key });

  /**
   * Create from left/right cell addresses.
   */
  public static fromCells = (left: t.IGridCell, right: t.IGridCell) => {
    return CellRange.fromKey(`${left.key}:${right.key}`);
  };

  /**
   * Converts range parts into a properly formatted range ID,
   * eg.
   *
   *    ("A1:A5", "Sheet1")        => "Sheet1!A1:A5"
   *    ("Sheet2!A1:A5", "Sheet1") => "Sheet2!A1:A5"    NB: Existing sheet within cell-key overrides `sheet` parameter.
   *
   */
  // public static toId = (key: string, sheet?: string) => {
  //   key = key && key.trim();
  //   if (!key) {
  //     throw new Error(`A range key must be specified.`);
  //   }
  //   key = key.replace(/^!+/, '');
  //   if (key.includes('!')) {
  //     const range = CellRange.fromKey(key);
  //     key = range.key;
  //     sheet = range.sheetId;
  //   } else {
  //     sheet = sheet ? sheet.trim() : sheet;
  //     if (sheet) {
  //       sheet = sheet.replace(/\!+$/, '');
  //     }
  //   }
  //   return sheet ? `${sheet}!${key}` : key;
  // };

  /**
   * Parses the given key into it's constituent parts.
   */
  public static parseKeyParts = parser.toRangeParts;

  /**
   * Determines whether the given key represents a range.
   */
  public static isRangeKey = cell.isRangeKey;

  /**
   * The range key, stripped of any absolute position characters ("$")
   * eg: A$1:B$3 => A1:B3
   */
  public readonly key: string;

  /**
   * The category of range this value represents.
   */
  public readonly type: t.RangeAddressType;

  /**
   * The left side Cell of the range.
   */
  public readonly left: t.IGridCell;

  /**
   * The right side Cell of the range.
   */
  public readonly right: t.IGridCell;

  /**
   * Flag indicating if the range is valid.
   * If not valid see the descriptive `error` field.
   */
  public isValid: boolean;

  /**
   * Description of any parsing or formatting errors on the range value.
   */
  public error: string | undefined;

  private internal: {
    key?: string;
    square?: CellRange;
    cellKeys?: string[];
  } = {};

  private constructor(options: { key: string }) {
    // Setup initial conditions.
    const key = options.key.replace(/^[\s\=\!]*/, '').trimRight();
    this.internal.key = key;
    this.isValid = true;

    // Parse the key into constituent parts.
    const uriPrefix = URI_PREFIX;
    const rangeParts = parser.toRangeParts(key);
    const leftParts = parser.toParts(rangeParts.left, { uriPrefix });
    const rightParts = parser.toParts(rangeParts.right, { uriPrefix });
    const leftSheet = leftParts.sheet || rightParts.sheet;
    const rightSheet = rightParts.sheet || leftParts.sheet;

    // Ensure sheet value is the same left and right.
    if (leftSheet !== rightSheet) {
      this.setError(`Ranges can only exist on a single sheet.`);
    }

    // TEMP 🐷

    // Construct fully formatted left/right keys.
    // const toCellKey = (cellKey: string, sheetId: string) =>
    //   cellKey ? CellUri.toId(cellKey, sheetId) : '';
    // const leftKey = toCellKey(leftParts.cell, leftSheet);
    // const rightKey = toCellKey(rightParts.cell, rightSheet);

    // Store values.
    const left = (this.left = cell.toCell(leftParts.cell, { relative: true }));
    const right = (this.right = cell.toCell(rightParts.cell, { relative: true }));
    this.key = `${this.left.key}:${this.right.key}`; // NB: Stripped of "$" chars.

    // Derive the category of range.
    const getType = (
      rangeKey: string,
      left: t.IGridCell,
      right: t.IGridCell,
    ): t.RangeAddressType => {
      if (rangeKey === '*:*') {
        return 'ALL';
      }
      const leftType = cell.toType(left);
      const rightType = cell.toType(right);
      if (
        (leftType === 'CELL' && rightType === 'COLUMN') ||
        (leftType === 'COLUMN' && rightType === 'CELL')
      ) {
        return 'PARTIAL_COLUMN';
      }
      if (
        (leftType === 'CELL' && rightType === 'ROW') ||
        (leftType === 'ROW' && rightType === 'CELL')
      ) {
        return 'PARTIAL_ROW';
      }
      if (
        (leftType === 'CELL' && (right.key === '*' || right.key === '**')) ||
        (rightType === 'CELL' && (left.key === '*' || left.key === '**'))
      ) {
        return 'PARTIAL_ALL';
      }
      return leftType as t.RangeAddressType;
    };
    this.type = getType(this.key, left, right);

    // Check for parse errors.
    if (rangeParts.error) {
      this.setError(rangeParts.error);
    }

    // Check left and right addresses for errors.
    const checkEdgeError = (error?: string) => {
      if (error) {
        this.setError(error);
      }
    };
    checkEdgeError(leftParts.error);
    checkEdgeError(rightParts.error);

    // Ensure wildcards are only permitted for "ALL" category types.
    // NB: May support further infinity ranges in future for
    //     logical consistency such as "3:*", "A:*" etc.
    const checkWildcards = () => {
      if (this.type === 'ALL' || this.type === 'PARTIAL_ALL') {
        return;
      }
      if ((left.key === '*' && right.key !== '*') || (right.key === '*' && left.key !== '*')) {
        this.setError(
          `Wildcard cells can only be specified for ALL ("*:*") or PARTIAL_ALL ("A1:*") ranges.`,
        );
      }
    };
    checkWildcards();
  }

  // TEMP 🐷
  /**
   * Retrieves the fully qualified identifier of the range ("{sheet}!{left}:{right}")
   * stripped of any absolute position characters ("$").
   */
  // public get id() {
  //   return CellRange.toId(this.key, this.sheetId);
  // }

  // TEMP 🐷
  /**
   * Formats the fully qualified ID inserting the given sheet if one is
   * not already present within the cell-range.
   */
  // public toId(sheet?: string) {
  //   return CellUri.toId(this.key, this.sheetId || sheet);
  // }

  // TEMP 🐷
  /**
   * Retrieves the sheet the range exists on (or empty string).
   */
  // public get sheetId() {
  //   return this.left.sheetId;
  // }

  /**
   * Creates a range string ensuring the values form a square (top-left/bottom-right).
   */
  public get square() {
    // Reuse existing square if already calculated.
    if (this.internal.square) {
      return this.internal.square;
    }

    const toCellSquare = () => {
      const left = this.left;
      const right = this.right;
      const minColumn = Math.min(left.column, right.column);
      const maxColumn = Math.max(left.column, right.column);
      const minRow = Math.min(left.row, right.row);
      const maxRow = Math.max(left.row, right.row);
      const min = cell.toKey(minColumn, minRow);
      const max = cell.toKey(maxColumn, maxRow);
      return `${min}:${max}`;
    };

    const toColumnSquare = () => {
      const left = this.left;
      const right = this.right;
      const minColumn = Math.min(left.column, right.column);
      const maxColumn = Math.max(left.column, right.column);
      const min = alpha.toCharacter(minColumn);
      const max = alpha.toCharacter(maxColumn);
      return `${min}:${max}`;
    };

    const toRowSquare = () => {
      const left = this.left;
      const right = this.right;
      const min = Math.min(left.row, right.row) + 1;
      const max = Math.max(left.row, right.row) + 1;
      return `${min}:${max}`;
    };

    const toPartialColumnSquare = () => {
      // The COLUMN (infinity) is greater than CELL.
      const leftType = cell.toType(this.left);
      const min = leftType === 'COLUMN' ? this.right : this.left;
      const max = leftType === 'COLUMN' ? this.left : this.right;
      return `${min.key}:${max.key}`;
    };

    const toPartialRowSquare = () => {
      // The ROW (infinity) is greater than CELL.
      const leftType = cell.toType(this.left);
      const min = leftType === 'ROW' ? this.right : this.left;
      const max = leftType === 'ROW' ? this.left : this.right;
      return `${min.key}:${max.key}`;
    };

    const getRangeKey = () => {
      switch (this.type) {
        case 'ALL':
          return this.key; // "*:*" is already a square - return this instance of the range.
        case 'CELL':
          return toCellSquare();
        case 'COLUMN':
          return toColumnSquare();
        case 'ROW':
          return toRowSquare();
        case 'PARTIAL_COLUMN':
          return toPartialColumnSquare();
        case 'PARTIAL_ROW':
          return toPartialRowSquare();
        case 'PARTIAL_ALL':
          return this.key; // PARTIAL_ALL ranges do not change.
        default:
          throw new Error(`Type '${this.type}' not supported.`);
      }
    };

    const range = getRangeKey();
    const result = range === this.key ? this : CellRange.fromKey(range); // NB: Return same Range if already a square.
    this.internal.square = result;
    return result;
  }

  /**
   * Determines if the given cell-key exists within the range.
   */
  public contains(cell: string): boolean;

  /**
   * Determines if the given cell (from column/row) exists within the range.
   */
  public contains(column?: number, row?: number): boolean;

  public contains(...args: any[]): boolean {
    const cellKey: string =
      args.length === 1
        ? args[0] // From string or [CellAddress].
        : cell.toKey(args[0], args[1]); // From indexes.
    const start = this.left;
    const end = this.right;

    const columnContains = (cell: t.IGridCellPosition) => {
      const index = cell.column;
      return start.column === undefined || end.column === undefined
        ? false
        : index >= start.column && index <= end.column;
    };

    const rowContains = (cell: t.IGridCellPosition) => {
      const index = cell.row;
      return start.row === undefined || end.row === undefined
        ? false
        : index >= start.row && index <= end.row;
    };

    const cellsContain = (cell: t.IGridCellPosition) => {
      if (!columnContains(cell)) {
        return false;
      }
      if (!rowContains(cell)) {
        return false;
      }
      return true;
    };

    const patialColumnContains = (cell: t.IGridCellPosition) => {
      if (!columnContains(cell)) {
        return false;
      }
      const index = cell.row;
      return start.row === undefined ? false : index >= start.row;
    };

    const patialRowContains = (cell: t.IGridCellPosition) => {
      if (!rowContains(cell)) {
        return false;
      }
      const index = cell.column;
      return start.column === undefined ? false : index >= start.column;
    };

    const partialAllContains = (cell: t.IGridCellPosition) => {
      if (start.key === '*') {
        // Top/left to cell.
        return cell.column <= end.column && cell.row <= end.row;
      }
      if (end.key === '*') {
        // Cell to top/right.
        return cell.column >= start.column && cell.row <= start.row;
      }
      if (start.key === '**') {
        // Bottom/left to cell.
        return cell.column <= end.column && cell.row >= end.row;
      }
      if (end.key === '**') {
        // Cell to bottom/right.
        return cell.column >= start.column && cell.row >= start.row;
      }
      return false;
    };

    const pos = cell.fromKey(cellKey);
    switch (this.type) {
      case 'ALL':
        return true; // All cells are contained within this range.
      case 'CELL':
        return cellsContain(pos);
      case 'COLUMN':
        return columnContains(pos);
      case 'ROW':
        return rowContains(pos);
      case 'PARTIAL_COLUMN':
        return patialColumnContains(pos);
      case 'PARTIAL_ROW':
        return patialRowContains(pos);
      case 'PARTIAL_ALL':
        return partialAllContains(pos);

      default:
        throw new Error(`Type '${this.type}' not supported.`);
    }
  }

  /**
   * Retrieves a sorted array of cell-keys for the range square
   * (eg. [A1, A2, B1...]).
   *  Note:
   *    - Returns empty array when the range is COLUMN or ROW as
   *      these are logical ranges and the array would be infinite.
   *    - The result is cached, future calls to this property do
   *      not incur the cost of calcualting the set of keys.
   */

  // TEMP 🐷 rename to "keys"

  public get cellKeys(): string[] {
    if (this.internal.cellKeys) {
      return this.internal.cellKeys;
    }
    const done = (result: string[]) => {
      this.internal.cellKeys = result;
      return result;
    };

    const toKeys = (min: t.IGridCellPosition, max: t.IGridCellPosition): string[] => {
      const totalColumns = max.column - min.column + 1;
      const totalRows = max.row - min.row + 1;
      const result = Array.from({ length: totalColumns })
        .map((v, i) => min.column + i)
        .map(columnIndex =>
          Array.from({ length: totalRows })
            .map((v, i) => min.row + i)
            .map(rowIndex => {
              return cell.toKey(columnIndex, rowIndex);
            }),
        );
      return valueUtil.flatten(result);
    };

    switch (this.type) {
      case 'ALL':
      case 'COLUMN':
      case 'ROW':
      case 'PARTIAL_COLUMN':
      case 'PARTIAL_ROW':
      case 'PARTIAL_ALL':
        return done([]); // NB: Only CELL ranges can be calculated, otherwise infinity.

      case 'CELL':
        const range = this.square;
        return done(toKeys(range.left, range.right));

      default:
        throw new Error(`Type '${this.type}' not supported.`);
    }
  }

  /**
   * Retrieves the edge(s) the given cell is on.
   */
  public edge(input: string | t.IGridCellPosition): t.GridCellEdge[] {
    const { column, row } = cell.toCell(input);

    let result: t.GridCellEdge[] = [];
    if (!this.contains(column, row)) {
      return result;
    }
    const left = this.left;
    const right = this.right;

    if (left.row === row) {
      result = [...result, 'TOP'];
    }
    if (right.column === column) {
      result = [...result, 'RIGHT'];
    }
    if (right.row === row) {
      result = [...result, 'BOTTOM'];
    }
    if (left.column === column) {
      result = [...result, 'LEFT'];
    }

    return result;
  }

  /**
   * Creates a new range with the given edge adjusted.
   */
  public adjustSize(
    edge: t.GridCellEdge,
    amount: number,
    options: { totalColumns?: number; totalRows?: number } = {},
  ) {
    const square = this.square;
    const { totalColumns = Number.MAX_SAFE_INTEGER, totalRows = Number.MAX_SAFE_INTEGER } = options;

    const cellFromIndex = (column: number, row: number) => {
      column = R.clamp(0, totalColumns - 1, column);
      row = R.clamp(0, totalRows - 1, row);
      return cell.toCell({ column, row });
    };

    switch (edge) {
      case 'TOP':
        const topRow = square.left.row + amount;
        return CellRange.fromCells(cellFromIndex(square.left.column, topRow), square.right);
      case 'BOTTOM':
        const bottomRow = square.right.row + amount;
        return CellRange.fromCells(square.left, cellFromIndex(square.right.column, bottomRow));
      case 'LEFT':
        const leftColumn = square.left.column + amount;
        return CellRange.fromCells(cellFromIndex(leftColumn, square.left.row), square.right);

      case 'RIGHT':
        const rightColumn = square.right.column + amount;
        return CellRange.fromCells(square.left, cellFromIndex(rightColumn, square.right.row));
      default:
        throw new Error(`Edge '${edge}' not supported.`);
    }
  }

  /**
   * Converts the object into a representative string.
   */
  public toString() {
    return !this.error ? `[${this.type}_RANGE/${this.key}]` : `[${this.error}]`;
  }

  /**
   * [Helpers]
   */
  private setError(message: string) {
    if (message.startsWith('INVALID')) {
      message = message.substr(message.indexOf('.') + 2);
    }
    message = `INVALID RANGE "${this.internal.key}". ${message}`;
    this.isValid = false;
    this.error = message;
  }
}
