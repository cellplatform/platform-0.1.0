import { coord, R, t } from '../../common';

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
    const { row, column } = coord.cell.fromKey(cellKey);
    return new Cell({ table, row, column });
  }

  public static toKey(args: { row: number; column: number }) {
    return coord.cell.toKey(args.column, args.row);
  }

  public static fromKey(cellKey: string) {
    return coord.cell.fromKey(cellKey);
  }

  public static toPosition(ref: t.CellRef) {
    return typeof ref === 'string' ? Cell.fromKey(ref) : ref;
  }

  public static toRangePositions(args: { range: string; totalColumns: number; totalRows: number }) {
    const range = coord.range.fromKey(args.range);
    const start = range.left;
    const end = range.right;

    if (range.type === 'COLUMN') {
      start.row = 0;
      end.row = args.totalRows - 1;
    }

    if (range.type === 'ROW') {
      start.column = 0;
      end.column = args.totalColumns - 1;
    }

    return { start, end };
  }

  public static changeEvent(args: { cell: t.ICell; from?: t.CellValue; to?: t.CellValue }) {
    const { cell, from, to } = args;
    const value = { from, to };
    const isChanged = !R.equals(value.from, value.to);

    const payload: t.IGridCellChange = {
      cell,
      value,
      isChanged,
      isCancelled: false,
      isModified: false,
      cancel() {
        payload.isCancelled = true;
      },
      modify(change: t.CellValue) {
        value.to = change;
        payload.isModified = true;
      },
    };

    return payload;
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: { table: Handsontable; row: number; column: number }) {
    this._.table = args.table;
    this.row = args.row;
    this.column = args.column;
  }

  public get isDisposed() {
    return this._.table.isDestroyed;
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

  private get td() {
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

  public get siblings() {
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
    return `[Cell|${this.key}]`;
  }
}
