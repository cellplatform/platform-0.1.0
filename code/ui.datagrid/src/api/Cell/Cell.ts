import { coord, R, t, defaultValue, util } from '../../common';

export type CellChangeField = keyof t.IGridCellProps | 'VALUE' | 'PROPS';

/**
 * API for accessing and manipulating a cell.
 */
export class Cell<P extends t.IGridCellProps = t.IGridCellProps> implements t.ICell<P> {
  /**
   * [Static]
   */
  public static isEmpty = util.isEmptyCell;
  public static isEmptyProps = util.isEmptyCellProps;
  public static isEmptyValue = util.isEmptyCellValue;
  public static isChanged = util.isCellChanged;
  public static diff = util.cellDiff;
  public static props = util.toCellProps;

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

  public static changeEvent(args: { cell: t.ICell; from?: t.IGridCell; to?: t.IGridCell }) {
    const { cell, from, to } = args;
    const value = { from, to };
    let isChanged: boolean | undefined;
    const { key, row, column } = cell;

    const payload: t.IGridCellChange = {
      cell: { key, row, column },
      value,
      get isChanged() {
        return isChanged === undefined ? (isChanged = !R.equals(value.from, value.to)) : isChanged;
      },
      isCancelled: false,
      isModified: false,
      cancel() {
        payload.isCancelled = true;
      },
      modify(change: t.IGridCell) {
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

  private get data() {
    return this._.table.getDataAtCell(this.row, this.column) || {};
  }

  public get value(): t.CellValue {
    const data = this.data;
    return typeof data === 'object' ? data.value : undefined;
  }

  public get props(): P {
    const data = this.data;
    return typeof data === 'object' ? data.props || {} : {};
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

  public get rowspan() {
    return defaultValue(Cell.props(this.props).merge.rowspan, 1);
  }

  public get colspan() {
    return defaultValue(Cell.props(this.props).merge.colspan, 1);
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
