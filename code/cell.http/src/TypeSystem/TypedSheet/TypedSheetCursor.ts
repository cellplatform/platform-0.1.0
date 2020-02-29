import { Schema, t } from '../common';
import { TypedSheetRow } from './TypedSheetRow';

type ITypedSheetCursorArgs = {
  ns: string; // "ns:<uri>"
  fetch: t.ISheetFetcher;
  types: t.IColumnTypeDef[];
  events$: t.Subject<t.TypedSheetEvent>;
  index: number;
  take?: number;
};

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
    this._events$ = args.events$;
  }

  /**
   * [Fields]
   */
  private readonly _events$: t.Subject<t.TypedSheetEvent>;
  private readonly fetch: t.ISheetFetcher;
  private readonly types: t.IColumnTypeDef[];

  public readonly uri: string;
  public readonly index: number = -1;
  public readonly take: number | undefined = undefined;
  public total: number = -1;
  public rows: t.ITypedSheetRow<T>[] = [];

  /**
   * [Methods]
   */

  public row(index: number): t.ITypedSheetRowProps<T> | undefined {
    return this.rows[index]?.props;
  }

  /**
   * [Internal]
   */

  public async load() {
    const types = this.types;
    const self = this as t.ITypedSheetCursor<T>;
    if (types.length === 0) {
      return self;
    }

    // Query cell data from the network.
    const query = `${types[0].column}:${types[types.length - 1].column}`;
    const ns = this.uri;
    const { cells, total, error } = await this.fetch.getCells({ ns, query });
    if (error) {
      throw new Error(error.message);
    }

    // Set total.
    this.total = total.rows;

    // Extract the raw-row-data from the retrieved cells.
    type RowData = {
      key: string;
      index: number;
      type: t.IColumnTypeDef;
      data: t.ICellData;
    };
    const rows: RowData[][] = [];
    Object.keys(cells).forEach(key => {
      const data = cells[key];
      const parsed = Schema.coord.cell.toCell(key);
      const column = Schema.coord.cell.toColumnKey(parsed.column);
      const type = types.find(type => type.column === column);
      if (data && type) {
        const index = parsed.row;
        const row: RowData = { key, index, type, data };
        rows[index] = rows[index] || [];
        rows[index].push(row);
      }
    });

    // Build this list of row items.
    this.rows = rows.map(data => {
      const index = data[0].index;
      const uri = Schema.uri.create.row(ns, (index + 1).toString());
      const columns = data.map(({ data, type }) => ({ data, type }));
      const events$ = this._events$;
      return TypedSheetRow.create<T>({ index, uri, columns, events$ });
    });

    // Finish up.
    return self;
  }
}
