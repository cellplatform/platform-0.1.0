import { coord, Uri } from '../../common';
import { TypedSheetRow } from './TypedSheetRow';
import * as t from './types';

type TypedSheetCursorArgs = {
  ns: string; // "ns:<uri>"
  types: t.IColumnTypeDef[];
  index: number;
  take?: number;
  ctx: t.SheetCtx;
};

type ColumnData = {
  key: string;
  row: number;
  type: t.IColumnTypeDef;
  data: t.ICellData;
};
type RowData = ColumnData[];

/**
 * A cursor for iterating over a set of sheet rows
 */
export class TypedSheetCursor<T> implements t.ITypedSheetCursor<T> {
  public static create = <T>(args: TypedSheetCursorArgs) => new TypedSheetCursor<T>(args);
  public static load = <T>(args: TypedSheetCursorArgs) => {
    return TypedSheetCursor.create<T>(args).load();
  };

  /**
   * [Lifecycle]
   */
  private constructor(args: TypedSheetCursorArgs) {
    this.uri = args.ns;
    this.types = args.types;
    this.index = args.index;
    this.take = args.take;
    this.ctx = args.ctx;
  }

  /**
   * [Fields]
   */
  private readonly ctx: t.SheetCtx;
  private readonly types: t.IColumnTypeDef[];
  // private readonly _events$: t.Subject<t.TypedSheetEvent>;

  public readonly uri: string;
  public readonly index: number = -1;
  public readonly take: number | undefined = undefined;
  public total: number = -1;
  public rows: t.ITypedSheetRow<T>[] = [];

  /**
   * [Methods]
   */
  public exists(rowIndex: number) {
    return Boolean(this.rows[rowIndex]);
  }

  public row(rowIndex: number): t.ITypedSheetRow<T> {
    if (rowIndex < 0) {
      throw new Error(`Row index must be >=0`);
    }

    if (!this.exists(rowIndex)) {
      this.rows[rowIndex] = this.createRow({ rowIndex });
    }

    return this.rows[rowIndex];
  }

  /**
   * [Internal]
   */

  public async load() {
    const ns = this.uri;
    const self = this as t.ITypedSheetCursor<T>;
    const types = this.types;
    if (types.length === 0) {
      return self;
    }

    // Query cell data from the network.
    const query = `${types[0].column}:${types[types.length - 1].column}`;
    const { cells, total, error } = await this.ctx.fetch.getCells({ ns, query });
    if (error) {
      throw new Error(error.message);
    }

    // Set total.
    this.total = total.rows;

    // Extract the raw row-data from the retrieved cells and build this list of row items.
    this.rows = this.toDataRows(cells).map(row => this.toRow({ row }));

    // Finish up.
    return self;
  }

  /**
   * [Internal]
   */
  private createRow(args: { rowIndex: number }) {
    const { rowIndex } = args;
    if (this.exists(rowIndex)) {
      throw new Error(`A row at index ${rowIndex} already exists.`);
    }

    // Construct empty row data.
    const row: RowData = [];
    this.types.forEach(type => {
      const key = `${type.column}${rowIndex + 1}`;
      const column: ColumnData = { key, row: rowIndex, type, data: {} };
      row.push(column);
    });

    // Create the new synthetic row model.
    return this.toRow({ row });
  }

  private toRow(args: { row: RowData }): t.ITypedSheetRow<T> {
    const { row } = args;
    const ns = this.uri;
    const ctx = this.ctx;
    const index = row[0].row;
    const uri = Uri.create.row(ns, (index + 1).toString());
    const columns = row.map(({ data, type }) => ({ data, type }));
    return TypedSheetRow.create<T>({ index, uri, columns, ctx });
  }

  private toDataRows(cells: t.ICellMap): RowData[] {
    const types = this.types;
    const rows: RowData[] = [];
    Object.keys(cells).forEach(key => {
      const data = cells[key];
      const cell = coord.cell.toCell(key);
      const columnKey = coord.cell.toColumnKey(cell.column);
      const type = types.find(type => type.column === columnKey);
      if (data && type) {
        const row = cell.row;
        const column: ColumnData = { key, row, type, data };
        rows[row] = rows[row] || [];
        rows[row].push(column);
      }
    });
    return rows;
  }
}
