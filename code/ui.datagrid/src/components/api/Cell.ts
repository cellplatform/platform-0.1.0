type IConstructArgs = {
  table: Handsontable;
  row: number;
  column: number;
};

/**
 * API for accessing and manipulating a cell.
 */
export class Cell {
  /**
   * [Static]
   */
  public static create(args: IConstructArgs) {
    return new Cell(args);
  }

  /**
   * [Constructor]
   */
  private constructor(args: IConstructArgs) {
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

  /**
   * [Siblings]
   */

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

  public get bottom() {
    const table = this._.table;
    const row = this.row + 1;
    const column = this.column;
    return row > table.countRows() - 1 ? undefined : Cell.create({ table, column, row });
  }
}
