import { R, t, value as valueUtil } from '../../common';
import { parser } from '../../parser';
import { cell } from '../../cell';
import { alpha } from '../../alpha';

/**
 * Represents a range of cells.
 */
export class CellRange {
  /**
   * [Static]
   */

  /**
   * Create from key (eg: "A1:C4", "A:B", "2:99" etc).
   */
  public static fromKey = (key: string) => new CellRange({ key });

  /**
   * Create from left/right cell addresses.
   */
  public static fromCells = (left: string | { key: string }, right: string | { key: string }) => {
    const leftKey = typeof left === 'object' ? left.key : left;
    const rightKey = typeof right === 'object' ? right.key : right;
    return CellRange.fromKey(`${leftKey}:${rightKey}`);
  };

  /**
   * Create a region that is the square around all given keys.
   */
  public static square(keys: Array<string | { key: string }>) {
    if (keys.length === 0) {
      throw new Error(`To create a region-square at least one key must be passed.`);
    }
    let list = keys.map(item => (typeof item === 'string' ? item : item.key));
    list = cell.sort(R.uniq(list));
    const max = cell.toKey(cell.max.column(list), cell.max.row(list));
    return CellRange.fromKey(`${list[0]}:${max}`);
  }

  /**
   * Parses the given key into it's constituent parts.
   */
  public static parseKeyParts = parser.toRangeParts;

  /**
   * Determines whether the given key represents a range.
   */
  public static isRangeKey = cell.isRangeKey;

  /**
   * [Fields]
   */

  /**
   * The range key, stripped of any absolute position characters ("$")
   * eg: A$1:B$3 => A1:B3
   */
  public readonly key: string;

  /**
   * The category of range this value represents.
   */
  public readonly type: t.CoordRangeType;

  /**
   * The left side Cell of the range.
   */
  public readonly left: t.ICoord;

  /**
   * The right side Cell of the range.
   */
  public readonly right: t.ICoord;

  /**
   * Flag indicating if the range is valid.
   * If not valid see the descriptive `error` field.
   */
  public isValid: boolean;

  /**
   * Description of any parsing or formatting errors on the range value.
   */
  public error: string | undefined;

  private readonly _: {
    key?: string;
    square?: CellRange;
    cellKeys?: string[];
  } = {};

  /**
   * [Lifecycle]
   */
  private constructor(options: { key: string }) {
    // Prepare key.
    const key = options.key.replace(/^[\s\=\!]*/, '').trimRight();

    // Store state.
    this._.key = key;
    this.isValid = true;

    // Parse the key into constituent parts.
    const rangeParts = parser.toRangeParts(key);
    const leftParts = parser.toParts(rangeParts.left);
    const rightParts = parser.toParts(rangeParts.right);
    const leftSheet = leftParts.sheet || rightParts.sheet;
    const rightSheet = rightParts.sheet || leftParts.sheet;

    // Ensure sheet value is the same left and right.
    if (leftSheet !== rightSheet) {
      this.setError(`Ranges can only exist on a single sheet.`);
    }

    // Store values.
    const left = (this.left = cell.toCell(leftParts.cell, { relative: true }));
    const right = (this.right = cell.toCell(rightParts.cell, { relative: true }));
    this.key = `${this.left.key}:${this.right.key}`; // NB: Stripped of "$" chars.

    // Derive the category of range.
    const getType = (rangeKey: string, left: t.ICoord, right: t.ICoord): t.CoordRangeType => {
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
      return leftType as t.CoordRangeType;
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

  /**
   * [Properties]
   */

  public get column() {
    return this.axis('COLUMN');
  }

  public get row() {
    return this.axis('ROW');
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
  public get keys(): string[] {
    if (this._.cellKeys) {
      return this._.cellKeys;
    }
    const done = (result: string[]) => {
      this._.cellKeys = result;
      return result;
    };

    const toKeys = (min: t.ICoordPosition, max: t.ICoordPosition): string[] => {
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
   * Creates a range ensuring the values form a square (top-left/bottom-right).
   */
  public get square() {
    // Reuse existing square if already calculated.
    if (this._.square) {
      return this._.square;
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
    this._.square = result;
    return result;
  }

  /**
   * API for determing boolean values about the range.
   */
  public get is() {
    const res = {
      /**
       * Determines if the range is a complete column.
       */
      column: (totalRows: number) => {
        return res.axis('COLUMN', totalRows);
      },

      /**
       * Determines if the range is a complete row.
       */
      row: (totalColumns: number) => {
        return res.axis('ROW', totalColumns);
      },

      cell: (totalColumns: number, totalRows: number) => {
        return !res.column(totalRows) && !res.row(totalColumns);
      },

      /**
       * Determines if the range is a complete axis (ROW/COLUMN).
       */
      axis: (axis: t.CoordAxis, total: number) => {
        const left = this.left;
        const right = this.right;
        const type = this.type;

        if (axis === 'COLUMN') {
          if (type === 'COLUMN') {
            return true;
          }
          if (left.row > 0) {
            return false;
          }
          if (type !== 'PARTIAL_ALL' && right.row + 1 < total) {
            return false;
          }
        }
        if (axis === 'ROW') {
          if (type === 'ROW') {
            return true;
          }
          if (left.column > 0) {
            return false;
          }
          if (type !== 'PARTIAL_ALL' && right.column + 1 < total) {
            return false;
          }
        }

        return true;
      },
    };

    return res;
  }

  /**
   * [Methods]
   */

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

    const columnContains = (cell: t.ICoordPosition) => {
      const index = cell.column;
      return start.column === undefined || end.column === undefined
        ? false
        : index >= start.column && index <= end.column;
    };

    const rowContains = (cell: t.ICoordPosition) => {
      const index = cell.row;
      return start.row === undefined || end.row === undefined
        ? false
        : index >= start.row && index <= end.row;
    };

    const cellsContain = (cell: t.ICoordPosition) => {
      if (!columnContains(cell)) {
        return false;
      }
      if (!rowContains(cell)) {
        return false;
      }
      return true;
    };

    const patialColumnContains = (cell: t.ICoordPosition) => {
      if (!columnContains(cell)) {
        return false;
      }
      const index = cell.row;
      return start.row === undefined ? false : index >= start.row;
    };

    const patialRowContains = (cell: t.ICoordPosition) => {
      if (!rowContains(cell)) {
        return false;
      }
      const index = cell.column;
      return start.column === undefined ? false : index >= start.column;
    };

    const partialAllContains = (cell: t.ICoordPosition) => {
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
   * Retrieves the edge(s) the given cell is on.
   */
  public edge(input: string | t.ICoordPosition): t.CoordEdge[] {
    const { column, row } = cell.toCell(input);

    let result: t.CoordEdge[] = [];
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
    edge: t.CoordEdge,
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
   * Formats range keys based on table size, returning a new [Range] object.
   */
  public formated(args: { totalColumns: number; totalRows: number }) {
    if (this.is.column(args.totalRows)) {
      const left = cell.toKey(this.left.column, undefined);
      const right = cell.toKey(this.right.column, undefined);
      return CellRange.fromKey(`${left}:${right}`);
    }
    if (this.is.row(args.totalColumns)) {
      const left = cell.toKey(undefined, this.left.row);
      const right = cell.toKey(undefined, this.right.row);
      return CellRange.fromKey(`${left}:${right}`);
    }
    return this; // No change.
  }

  /**
   * Converts the range to a width/height size.
   */
  public toSize(args: { totalColumns: number; totalRows: number }) {
    const { totalColumns, totalRows } = args;

    const square = this.square;
    const start = square.left;
    const end = square.right;

    const startColumn = Math.max(0, start.column);
    const endColumn = Math.min(end.column, totalColumns - 1);

    const startRow = Math.max(0, start.row);
    const endRow = Math.min(end.row, totalRows - 1);

    const width = start.column === -1 ? totalColumns : endColumn - startColumn + 1;
    const height = start.row === -1 ? totalRows : endRow - startRow + 1;

    return { width, height };
  }

  /**
   * Retrieves details about a single axis (COLUMN/ROW).
   */
  public axis(axis: t.CoordAxis) {
    const self = this; // tslint:disable-line

    const res = {
      get left() {
        return axis === 'COLUMN' ? self.left.column : self.left.row;
      },

      get right() {
        return axis === 'COLUMN' ? self.right.column : self.right.row;
      },

      /**
       * Retrieves the ROW or COLUMN keys represented by the range.
       */
      get keys(): string[] {
        const start = res.left;
        const end = res.right;
        return start < 0 || end < 0
          ? []
          : Array.from({ length: end + 1 - start })
              .map((v, i) => i + start)
              .map(i => cell.toAxisKey(axis, i) as string);
      },
    };

    return res;
  }

  /**
   * Converts the object into a representative string.
   */
  public toString() {
    return !this.error ? `[RANGE/${this.key}]` : `[${this.error}]`;
  }

  /**
   * [Helpers]
   */
  private setError(message: string) {
    if (message.startsWith('INVALID')) {
      message = message.substr(message.indexOf('.') + 2);
    }
    message = `INVALID RANGE "${this._.key}". ${message}`;
    this.isValid = false;
    this.error = message;
  }
}
