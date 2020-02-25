import * as t from './_types';
import { Schema } from './common';
import { SheetRow } from './SheetRow';

type ISheetCursorArgs = {
  ns: string; // "ns:<uri>"
  client: t.IHttpClient;
  types: t.ITypeDef[];
  index: number;
  take?: number;
};

/**
 * A cursor for iterating over a set of sheet rows
 */
export class SheetCursor<T> implements t.ISheetCursor<T> {
  public static create = <T>(args: ISheetCursorArgs) => new SheetCursor<T>(args);
  public static load = <T>(args: ISheetCursorArgs) => SheetCursor.create<T>(args).load();

  /**
   * [Lifecycle]
   */
  private constructor(args: ISheetCursorArgs) {
    this.uri = args.ns;
    this.client = args.client;
    this.types = args.types;
    this.index = args.index;
    this.take = args.take;
  }

  /**
   * [Fields]
   */
  private readonly client: t.IHttpClient;
  private readonly types: t.ITypeDef[];

  public readonly uri: string;
  public readonly index: number = -1;
  public readonly take: number | undefined = undefined;
  public readonly total: number = -1;
  public rows: Array<t.ISheetRow<T>> = [];

  /**
   * [Methods]
   */

  public row(index: number): T | undefined {
    const row = this.rows[index];
    return row?.props;
  }

  /**
   * [Internal]
   */

  public async load() {
    const types = this.types;
    const self = this as t.ISheetCursor<T>;
    if (types.length === 0) {
      return self;
    }

    // Query for cell data.
    const query = `${types[0].column}:${types[types.length - 1].column}`;
    const ns = this.uri;
    const res = await this.client.ns(ns).read({ cells: query });
    if (res.error) {
      const err = `Failed to retrieve cells "${query}" within namespace [${ns}]. ${res.error.message}`;
      throw new Error(err);
    }
    const cells = res.body.data.cells || {};

    // Construct the raw row data from the result-set.
    type RowData = {
      key: string;
      index: number;
      type: t.ITypeDef;
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
      return SheetRow.create<T>({ index, uri, columns });
    });

    // Finish up.
    return self;
  }
}
