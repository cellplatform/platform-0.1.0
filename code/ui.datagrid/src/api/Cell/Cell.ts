import { t, R, cellUtil } from '../../common';

/**
 * API for accessing and manipulating a cell.
 */
export class Cell implements t.ICell {
  /**
   * [Static]
   */
  public static create(args: { table: Handsontable; row: number; column: number }) {
    return new Cell(args);
  }

  public static createFromKey(args: { table: Handsontable; cellKey: string }) {
    const { table, cellKey } = args;
    const { row, column } = cellUtil.cell.fromKey(cellKey);
    return new Cell({ table, row, column });
  }

  public static toKey(args: { row: number; column: number }) {
    return cellUtil.cell.toKey(args.column, args.row);
  }

  public static fromKey(cellKey: string) {
    return cellUtil.cell.fromKey(cellKey);
  }

  public static toPosition(ref: t.CellRef) {
    return typeof ref === 'string' ? Cell.fromKey(ref) : ref;
  }

  public static toRangePositions(rangeKey: string) {
    const parts = cellUtil.parser.toRangeParts(rangeKey);
    const start = Cell.toPosition(parts.left);
    const end = Cell.toPosition(parts.right);
    return { start, end };
  }

  /**
   * [Constructor]
   */
  private constructor(args: { table: Handsontable; row: number; column: number }) {
    this._.table = args.table;
    this.row = args.row;
    this.column = args.column;
  }

  /**
   * [Fields]
   */
  public readonly row: number;
  public readonly column: number;
  private readonly _ = {
    table: (undefined as unknown) as Handsontable,
    td: undefined as HTMLTableCellElement | undefined,
  };

  /**
   * [Properties]
   */
  public get key() {
    const row = this.row;
    const column = this.column;
    return Cell.toKey({ column, row });
  }

  public get isDisposed() {
    return this._.table.isDestroyed;
  }

  public get td() {
    this._.td = this._.td || (this._.table.getCell(this.row, this.column) as HTMLTableCellElement);
    return this._.td;
  }

  public get size() {
    const width = this.width;
    const height = this.height;
    return { width, height };
  }

  public get width() {
    return this.td.offsetWidth;
  }

  public get height() {
    return this.td.offsetHeight;
  }

  public get value(): t.CellValue {
    return this._.table.getDataAtCell(this.row, this.column);
  }
  public set value(value: t.CellValue) {
    if (!R.equals(value, this.value)) {
      this._.table.setDataAtCell(this.row, this.column, value);
    }
  }

  public get sibling() {
    const table = this._.table;
    const cell = this; // tslint:disable-line
    const row = cell.row;
    const column = cell.column;
    return {
      get left() {
        const column = cell.column - 1;
        return column < 0 ? undefined : Cell.create({ table, row, column });
      },
      get right() {
        const column = cell.column + 1;
        return column > table.countCols() - 1 ? undefined : Cell.create({ table, row, column });
      },
      get top() {
        const row = cell.row - 1;
        return row < 0 ? undefined : Cell.create({ table, row, column });
      },
      get bottom() {
        const row = cell.row + 1;
        return row < 0 ? undefined : Cell.create({ table, column, row });
      },
    };
  }

  /**
   * [Methods]
   */

  /**
   * Display string representation of the cell.
   */
  public toString() {
    return `[Cell|row:${this.row}, column:${this.column}]`;
  }

  /**
   * Determines if the cell matches the given position coordinates.
   */
  public isPosition(args: { row: number; column: number }) {
    return this.row === args.row && this.column === args.column;
  }
}
