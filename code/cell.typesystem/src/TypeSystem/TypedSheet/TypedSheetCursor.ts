import { coord, t, Uri, util } from './common';
import { TypedSheetRow } from './TypedSheetRow';

type TypedSheetCursorArgs = {
  ns: string | t.INsUri; // "ns:<uri>"
  types: t.IColumnTypeDef[];
  index: number;
  take?: number;
  ctx: t.SheetCtx;
};

type ColumnData = {
  key: string;
  row: number;
  typeDef: t.IColumnTypeDef;
  cell: t.ICellData;
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
    this.uri = util.formatNsUri(args.ns);
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

  public readonly uri: t.INsUri;
  public readonly index: number = -1;
  public readonly take: number | undefined = undefined;
  public total: number = -1;
  public rows: t.ITypedSheetRow<T>[] = [];

  /**
   * [Methods]
   */
  public exists(index: number) {
    return Boolean(this.rows[index]);
  }

  public row(index: number): t.ITypedSheetRow<T> {
    if (index < 0) {
      throw new Error(`Row index must be >=0`);
    }

    if (!this.exists(index)) {
      this.rows[index] = this.createRow(index);
    }

    return this.rows[index];
  }

  public async load() {
    const ns = this.uri.toString();
    const self = this as t.ITypedSheetCursor<T>;
    const types = this.types;
    if (types.length === 0) {
      return this;
    }

    /**
     * TODO 🐷
     * - take subset
     */

    // Query cell data from the network.
    const query = `${types[0].column}:${types[types.length - 1].column}`;
    const { cells, total, error } = await this.ctx.fetch.getCells({ ns, query });
    if (error) {
      throw new Error(error.message);
    }

    // Set total.
    this.total = total.rows;

    // console.log('this.total', this.total);
    // console.log('query', query);
    // console.log('this.index', this.index);
    // console.log('this.take', this.take);

    const maxRow = coord.cell.max.row(Object.keys(cells));

    // TEMP 🐷HACK - derive total rows to load from the index/take
    console.log('Cursor.Load :: maxRow', maxRow);

    const wait = Array.from({ length: 10 }).map((v, i) => {
      // console.log('i', i);
      return this.row(i).load();
    });

    await Promise.all(wait);

    // Finish up.
    return self;
  }

  /**
   * [INTERNAL]
   */

  private createRow(index: number) {
    const uri = Uri.create.row(this.uri.toString(), (index + 1).toString());
    const columns = this.types;
    const ctx = this.ctx;
    return TypedSheetRow.create<T>({ uri, columns, ctx });
  }
}
