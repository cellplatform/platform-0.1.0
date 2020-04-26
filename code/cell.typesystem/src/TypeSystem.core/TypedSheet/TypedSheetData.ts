import { coord, t, Uri, util } from './common';
import { TypedSheetRow } from './TypedSheetRow';

type IArgs = {
  ns: string | t.INsUri;
  typename: string;
  types: t.IColumnTypeDef[];
  ctx: t.SheetCtx;
  range?: string;
};

type ILoading<T> = { query: string; promise: Promise<t.ITypedSheetData<T>> };

/**
 * An exanding data-cursor for iterating over a set of rows
 * within a sheet for a particular type.
 */
export class TypedSheetData<T> implements t.ITypedSheetData<T> {
  public static create = <T>(args: IArgs): t.ITypedSheetData<T> => {
    return new TypedSheetData<T>(args);
  };

  public static DEFAULT = {
    RANGE: '1:500',
    PAGE: 500,
  };

  public static formatRange(input?: string) {
    const text = (input || '').trim();
    const DEFAULT = TypedSheetData.DEFAULT;
    if (!text) {
      return DEFAULT.RANGE;
    }

    const range = coord.range.fromKey(text);
    if (!range.isValid) {
      return DEFAULT.RANGE;
    }

    const left = {
      key: range.left.key,
      index: range.left.row,
      isInfinity: isInfinity(range.left.key),
    };
    const right = {
      key: range.right.key,
      index: range.right.row,
      isInfinity: isInfinity(range.right.key),
    };

    if (left.isInfinity && right.isInfinity) {
      return DEFAULT.RANGE;
    }
    if (left.isInfinity) {
      left.index = DEFAULT.PAGE - 1;
    }
    if (right.isInfinity) {
      right.index = DEFAULT.PAGE - 1;
    }

    const edges = [Math.max(0, left.index) + 1, Math.max(0, right.index) + 1].sort(diff);
    return `${edges[0]}:${edges[1]}`;
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IArgs) {
    this.uri = util.formatNsUri(args.ns);
    this.typename = args.typename;
    this.types = args.types;
    this.ctx = args.ctx;
    this._range = TypedSheetData.formatRange(args.range);
  }

  /**
   * [Fields]
   */
  private readonly ctx: t.SheetCtx;
  private _rows: t.ITypedSheetRow<T>[] = [];
  private _range: string;
  private _status: t.ITypedSheetData<T>['status'] = 'INIT';
  private _total = -1;
  private _loading: ILoading<T>[] = [];
  private _isLoaded = false;

  public readonly uri: t.INsUri;
  public readonly typename: string;
  public readonly types: t.IColumnTypeDef[];

  /**
   * [Properties]
   */
  public get rows() {
    return this._rows;
  }

  public get range() {
    return this._range;
  }

  public get status() {
    return this._status;
  }

  public get isLoaded() {
    return this._isLoaded;
  }

  public get total() {
    return this._total;
  }

  /**
   * [Methods]
   */
  public exists(index: number) {
    return Boolean(this._rows[index]);
  }

  public row(index: number): t.ITypedSheetRow<T> {
    if (index < 0) {
      throw new Error(`Row index must be >=0`);
    }

    if (!this.exists(index)) {
      this._rows[index] = this.createRow(index);
    }

    return this._rows[index];
  }

  public async load(args: string | t.ITypedSheetDataOptions): Promise<t.ITypedSheetData<T>> {
    const isLoaded = this.isLoaded;
    const ns = this.uri.toString();

    // Wrangle the given argument range.
    let argRange = typeof args === 'string' ? args : args?.range;
    if (argRange) {
      argRange = TypedSheetData.formatRange(argRange);
      if (!isLoaded) {
        // NB: Replace if this is the first load.
        this._range = argRange;
      }
      if (isLoaded) {
        // NB: Expand the range if this new range is additive (already loaded).
        this._range = mergeRanges(argRange, this._range);
      }
    }

    const query = argRange || this.range; // NB: Use the narrowest range passed to do the least amount of work (avoiding the complete expanded range).
    const alreadyLoading = this._loading.find(item => item.query === query);
    if (alreadyLoading) {
      return alreadyLoading.promise; // NB: A load operation is already in progress.
    }

    const promise = new Promise<t.ITypedSheetData<T>>(async (resolve, reject) => {
      this._status = 'LOADING';

      // Fire BEFORE event.
      this.fire({
        type: 'SHEET/loading',
        payload: {
          ns,
          range: query,
        },
      });

      // Query cell data from the network.
      const { total, error } = await this.ctx.fetch.getCells({ ns, query });
      if (error) {
        reject(new Error(error.message));
      }

      // Load the retrieved range of rows.
      const range = coord.range.fromKey(query);
      const min = Math.max(0, range.left.row);
      const max = Math.min(total.rows - 1, range.right.row);
      const wait = Array.from({ length: max - min + 1 }).map((v, i) => {
        const index = i + min;
        return this.row(index).load();
      });
      await Promise.all(wait);

      // Update state.
      this._total = total.rows;
      this._status = 'LOADED';
      this._isLoaded = true; // NB: Always true after initial load.
      this._loading = this._loading.filter(item => item.query !== query);

      // Fire BEFORE event.
      this.fire({
        type: 'SHEET/loaded',
        payload: {
          ns,
          range: this.range,
          total: this.total,
        },
      });

      // Finish up.
      return resolve(this);
    });

    this._loading = [...this._loading, { query, promise }]; // NB: Stored so repeat calls while loading return the same promise.
    return promise;
  }

  /**
   * [INTERNAL]
   */
  private fire(e: t.TypedSheetEvent) {
    this.ctx.event$.next(e);
  }

  private createRow(index: number) {
    const uri = Uri.create.row(this.uri.toString(), (index + 1).toString());
    const columns = this.types;
    const ctx = this.ctx;
    const typename = this.typename;
    return TypedSheetRow.create<T>({ typename, uri, columns, ctx });
  }
}

/**
 * [Helpers]
 */
const diff = (a: number, b: number) => a - b;
const isInfinity = (input: string) => input === '*' || input === '**';

const mergeRanges = (input1: string, input2: string) => {
  const range1 = coord.range.fromKey(input1).square;
  const range2 = coord.range.fromKey(input2).square;

  const min = Math.min(0, range1.left.row, range2.left.row) + 1;
  const max = Math.max(range1.right.row, range2.right.row) + 1;

  return `${min}:${max}`;
};
