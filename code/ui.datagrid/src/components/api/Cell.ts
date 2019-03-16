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
  };

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._.table.isDestroyed;
  }

  public get td() {
    return this._.table.getCell(this.row, this.column);
  }

  public get left() {
    const table = this._.table;
    const row = this.row;
    const column = this.column - 1;
    return column < 0 ? undefined : Cell.create({ table, row, column });
  }

  public get right() {
    const table = this._.table;
    const column = this.column + 1;
    return column > table.countCols() - 1
      ? undefined
      : Cell.create({ table, column, row: this.row });
  }

  public get top() {
    const table = this._.table;
    const row = this.row - 1;
    const column = this.column;
    return row < 0 ? undefined : Cell.create({ table, column, row });
  }

  public get bottom() {
    const table = this._.table;
    const row = this.row + 1;
    const column = this.column;
    return row > table.countRows() - 1 ? undefined : Cell.create({ table, column, row });
  }
}
