import { coord, t, Uri } from '../common';
import { TypedSheetRow } from './TypedSheetRow';

type ITypedSheetCursorArgs = {
  ns: string; // "ns:<uri>"
  fetch: t.ISheetFetcher;
  types: t.IColumnTypeDef[];
  events$: t.Subject<t.TypedSheetEvent>;
  index: number;
  cache: t.IMemoryCache;
  take?: number;
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
  public static create = <T>(args: ITypedSheetCursorArgs) => new TypedSheetCursor<T>(args);
  public static load = <T>(args: ITypedSheetCursorArgs) => TypedSheetCursor.create<T>(args).load();

  /**
   * [Lifecycle]
   */
  private constructor(args: ITypedSheetCursorArgs) {
    this.uri = args.ns;
    this.fetch = args.fetch;
    this.types = args.types;
    this.index = args.index;
    this.take = args.take;
    this.cache = args.cache;
    this._events$ = args.events$;
  }

  /**
   * [Fields]
   */
  private readonly cache: t.IMemoryCache;
  private readonly fetch: t.ISheetFetcher;
  private readonly types: t.IColumnTypeDef[];
  private readonly _events$: t.Subject<t.TypedSheetEvent>;

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
      this.rows[rowIndex] = this.createRow({ rowIndex, exists: false });
    }

    return this.rows[rowIndex];
  }

  public props(rowIndex: number): t.ITypedSheetRowProps<T> {
    return this.row(rowIndex)?.props;
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
    const { cells, total, error } = await this.fetch.getCells({ ns, query });
    if (error) {
      throw new Error(error.message);
    }

    // Set total.
    this.total = total.rows;

    // Extract the raw row-data from the retrieved
    // cells and build this list of row items.
    this.rows = this.toDataRows(cells).map(row => this.toRow({ row, exists: true }));

    // Finish up.
    return self;
  }

  /**
   * [Internal]
   */
  private createRow(args: { rowIndex: number; exists: boolean }) {
    const { rowIndex, exists } = args;
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
    return this.toRow({ row, exists });
  }

  private toRow(args: { row: RowData; exists: boolean }): t.ITypedSheetRow<T> {
    const { row, exists } = args;
    const ns = this.uri;
    const cache = this.cache;
    const index = row[0].row;
    const uri = Uri.create.row(ns, (index + 1).toString());
    const columns = row.map(({ data, type }) => ({ data, type }));
    const events$ = this._events$;
    return TypedSheetRow.create<T>({ index, uri, exists, columns, events$, cache });
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
