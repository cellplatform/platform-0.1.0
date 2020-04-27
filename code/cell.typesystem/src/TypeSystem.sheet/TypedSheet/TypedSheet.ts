import { Observable, Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import { TypeClient } from '../../TypeSystem.core';
import { ERROR, ErrorList, MemoryCache, t, Uri, util } from './common';
import { TypedSheetData } from './TypedSheetData';
import { TypedSheetState } from './TypedSheetState';

const fromClient = (client: t.IHttpClient) => {
  const fetch = util.fetcher.fromClient(client);
  return {
    load: <T = {}>(ns: string | t.INsUri) => TypedSheet.load<T>({ fetch, ns }),
  };
};

/**
 * Represents a namespace as a logical sheet of cells.
 */
export class TypedSheet<T = {}> implements t.ITypedSheet<T> {
  public static client = fromClient;

  /**
   * Load a sheet from the network.
   */
  public static async load<T = {}>(args: {
    ns: string | t.INsUri;
    fetch: t.ISheetFetcher;
    cache?: t.IMemoryCache;
    event$?: Subject<t.TypedSheetEvent>;
  }): Promise<t.ITypedSheet<T>> {
    const { fetch, cache, event$ } = args;
    const sheetNs = util.formatNsUri(args.ns);

    // Retrieve type definition for sheet.
    const res = await args.fetch.getNs({ ns: sheetNs.toString() });
    if (res.error) {
      throw new Error(res.error.message);
    }
    if (!res.ns?.type?.implements) {
      const err = `The namespace [${sheetNs}] does not contain an "implements" type reference.`;
      throw new Error(err);
    }
    const implementsNs = util.formatNsUri(res.ns?.type?.implements);

    // Load and parse the type definition.
    const loaded = await TypeClient.load({
      ns: implementsNs.toString(),
      fetch,
      cache,
    });

    // Finish up.
    const types = loaded.defs;
    const errors = loaded.errors;
    return new TypedSheet<T>({ sheetNs, types, fetch, cache, event$, errors });
  }

  /**
   * Creates a sheet.
   */
  public static async create<T = {}>(args: {
    implements: string | t.INsUri;
    ns?: string | t.INsUri; // NB: If not specified a new URI is generated.
    fetch: t.ISheetFetcher;
    cache?: t.IMemoryCache;
    event$?: Subject<t.TypedSheetEvent>;
  }): Promise<t.ITypedSheet<T>> {
    const { fetch, event$, cache } = args;
    const implementsNs = util.formatNsUri(args.implements);
    const sheetNs = args.ns ? util.formatNsUri(args.ns) : Uri.create.ns(Uri.cuid());

    const loaded = await TypeClient.load({
      ns: implementsNs.toString(),
      fetch,
      cache,
    });

    const types = loaded.defs;
    const errors = loaded.errors;
    return new TypedSheet<T>({ sheetNs, types, fetch, cache, event$, errors });
  }

  public static ctx(args: {
    fetch: t.ISheetFetcher;
    cache?: t.IMemoryCache;
    event$?: Subject<t.TypedSheetEvent>;
    dispose$?: Observable<{}>;
  }): t.SheetCtx {
    const fetch = args.fetch;
    const cache = args.cache || MemoryCache.create();
    const event$ = args.event$ || new Subject<t.TypedSheetEvent>();
    const dispose$ = args.dispose$ || new Subject<{}>();

    return {
      event$,
      dispose$,
      fetch,
      cache,
      sheet: {
        load<T>(args: { ns: string }) {
          return TypedSheet.load<T>({ ...args, fetch, cache, event$ });
        },
        create<T>(args: { implements: string }) {
          return TypedSheet.create<T>({ ...args, fetch, cache, event$ });
        },
      },
    };
  }

  /**
   * [Lifecycle]
   */

  private constructor(args: {
    sheetNs: string | t.INsUri;
    types: t.INsTypeDef[];
    fetch: t.ISheetFetcher;
    event$?: Subject<t.TypedSheetEvent>;
    cache?: t.IMemoryCache;
    errors?: t.ITypeError[];
  }) {
    const uri = (this.uri = util.formatNsUri(args.sheetNs));
    const cache = args.cache || MemoryCache.create();
    const event$ = args.event$ || new Subject<t.TypedSheetEvent>();
    const dispose$ = this.dispose$;

    this.event$ = event$.asObservable().pipe(takeUntil(dispose$), share());
    this.state = TypedSheetState.create({ sheet: this, event$, fetch: args.fetch, cache });

    this._ctx = TypedSheet.ctx({ fetch: this.state.fetch, event$, dispose$, cache }); // NB: Use the state-machine's wrapped fetcher.
    this._typeDefs = args.types;
    this._errorList = ErrorList.create({ defaultType: ERROR.TYPE.SHEET, errors: args.errors });
  }

  public dispose() {
    this._data = {};
    this._dispose$.next();
    this._dispose$.complete();
    this.state.dispose();
  }

  /**
   * [Fields]
   */

  private readonly _ctx: t.SheetCtx;
  private readonly _errorList: ErrorList;
  private readonly _dispose$ = new Subject<{}>();
  private readonly _typeDefs: t.INsTypeDef[];
  private _types: t.ITypedSheet['types'];
  private _data: { [typename: string]: TypedSheetData<any> } = {};

  public readonly uri: t.INsUri;
  public readonly state: TypedSheetState;
  public readonly dispose$ = this._dispose$.pipe(share());
  public readonly event$: Observable<t.TypedSheetEvent>;

  /**
   * [Properties]
   */

  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get ok() {
    return this.errors.length === 0;
  }

  public get errors() {
    return this._errorList.list;
  }

  public get types() {
    if (!this._types) {
      const types: t.ITypedSheet['types'] = [];
      this._typeDefs.forEach(def => {
        const { typename, columns } = def;
        const item = types.find(item => item.typename === typename);
        if (item) {
          item.columns = [...item.columns, ...columns];
        } else {
          types.push({ typename, columns });
        }
      });
      this._types = types;
    }
    return this._types;
  }

  /**
   * [Methods]
   */
  public toString() {
    return `[Sheet/${this.uri.toString()}]`;
  }

  public data<D = T>(input: string | t.ITypedSheetDataArgs) {
    this.throwIfDisposed('data');

    const args = typeof input === 'string' ? { typename: input } : input;
    const { typename, range } = args;
    const ns = this.uri;
    const ctx = this._ctx;

    // Check the pool in case the cursor has already been created.
    if (this._data[typename]) {
      const res = this._data[typename];
      if (args.range && res.range !== args.range) {
        res.expandRange(args.range);
      }
      return res as t.ITypedSheetData<D>;
    }

    // Retrieve the specified type definition.
    const defs = this._typeDefs;
    const def = defs.find(def => def.typename === typename);
    if (!def) {
      const names = defs.map(def => `'${def.typename}'`).join(', ');
      const err = `Definitions for typename '${typename}' not found. Available typenames: ${names}.`;
      throw new Error(err);
    }

    // Construct the cursor.
    const types = def.columns;
    const res: t.ITypedSheetData<D> = TypedSheetData.create<D>({
      sheet: this,
      typename,
      types,
      ctx,
      range,
    });
    this._data[typename] = res as TypedSheetData<any>;
    return res;
  }

  /**
   * [INTERNAL]
   */

  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because [TypedSheet] is disposed.`);
    }
  }
}
