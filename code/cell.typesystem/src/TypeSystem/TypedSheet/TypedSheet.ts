import { Observable, Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import { TypeClient } from '../TypeClient';
import { ERROR, ErrorList, MemoryCache, t, Uri, util } from './common';
import { TypedSheetCursor } from './TypedSheetCursor';
import { TypedSheetState } from './TypedSheetState';

const fromClient = (client: t.IHttpClient) => {
  const fetch = util.fetcher.fromClient(client);
  return {
    load: <T>(ns: string | t.INsUri) => TypedSheet.load<T>({ fetch, ns }),
  };
};

/**
 * Represents a namespace as a logical sheet of cells.
 */
export class TypedSheet<T> implements t.ITypedSheet<T> {
  public static client = fromClient;

  /**
   * Load a sheet from the network.
   */
  public static async load<T>(args: {
    ns: string | t.INsUri;
    fetch: t.ISheetFetcher;
    cache?: t.IMemoryCache;
    events$?: Subject<t.TypedSheetEvent>;
  }): Promise<t.ITypedSheet<T>> {
    const { fetch, events$, cache } = args;
    const sheetNs = util.formatNsUri(args.ns);

    // Retrieve type definition for sheet.
    const res = await args.fetch.getType({ ns: sheetNs.toString() });
    if (res.error) {
      throw new Error(res.error.message);
    }
    const implementsNs = util.formatNsUri(res.type.implements);
    if (!implementsNs) {
      const err = `The namespace [${sheetNs}] does not contain an "implements" type reference.`;
      throw new Error(err);
    }

    // Load and parse the type definition.
    const typeDef = await TypeClient.load({
      ns: implementsNs.toString(),
      fetch,
      cache,
    });

    // Finish up.
    return new TypedSheet<T>({ sheetNs, typeDef, fetch, events$, cache });
  }

  /**
   * Creates a sheet.
   */
  public static async create<T>(args: {
    implements: string | t.INsUri;
    ns?: string | t.INsUri; // NB: If not specified a new URI is generated.
    fetch: t.ISheetFetcher;
    cache?: t.IMemoryCache;
    events$?: Subject<t.TypedSheetEvent>;
  }): Promise<t.ITypedSheet<T>> {
    const { fetch, events$, cache } = args;
    const implementsNs = util.formatNsUri(args.implements);
    const sheetNs = args.ns ? util.formatNsUri(args.ns) : Uri.create.ns(Uri.cuid());

    const typeDef = await TypeClient.load({
      ns: implementsNs.toString(),
      fetch,
      cache,
    });

    if (!typeDef.ok) {
      const list = typeDef.errors.map(err => err.message).join('\n');
      const err = `Failed to create [TypedSheet] (${sheetNs.toString()}) because the type-definition (${implementsNs.toString()}) contains errors.\n${list}`;
      throw new Error(err);
    }

    return new TypedSheet<T>({
      sheetNs,
      typeDef,
      fetch,
      events$,
      cache,
    });
  }

  public static ctx(args: {
    fetch: t.ISheetFetcher;
    cache?: t.IMemoryCache;
    events$?: Subject<t.TypedSheetEvent>;
    dispose$?: Observable<{}>;
  }): t.SheetCtx {
    const fetch = args.fetch;
    const cache = args.cache || MemoryCache.create();
    const events$ = args.events$ || new Subject<t.TypedSheetEvent>();
    const dispose$ = args.dispose$ || new Subject<{}>();

    return {
      events$,
      dispose$,
      fetch,
      cache,
      sheet: {
        load<T>(args: { ns: string }) {
          return TypedSheet.load<T>({ ...args, fetch, cache, events$ });
        },
        create<T>(args: { implements: string }) {
          return TypedSheet.create<T>({ ...args, fetch, cache, events$ });
        },
      },
    };
  }

  /**
   * [Lifecycle]
   */

  private constructor(args: {
    sheetNs: string | t.INsUri;
    typeDef: t.INsTypeDef;
    fetch: t.ISheetFetcher;
    events$?: Subject<t.TypedSheetEvent>;
    cache?: t.IMemoryCache;
  }) {
    const uri = (this.uri = util.formatNsUri(args.sheetNs));
    const cache = args.cache || MemoryCache.create();
    const events$ = args.events$ || new Subject<t.TypedSheetEvent>();
    const dispose$ = this.dispose$;
    this.typeDef = args.typeDef;
    this.events$ = events$.asObservable().pipe(takeUntil(this._dispose$), share());
    this.state = TypedSheetState.create({ uri, events$, fetch: args.fetch, cache });
    this.ctx = TypedSheet.ctx({ fetch: this.state.fetch, events$, dispose$, cache }); // NB: Use the state-machine's wrapped fetcher.
    this.errorList = ErrorList.create({
      defaultType: ERROR.TYPE.SHEET,
      errors: this.typeDef.errors,
    });
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
    this.state.dispose();
  }

  /**
   * [Fields]
   */

  private readonly ctx: t.SheetCtx;
  private readonly typeDef: t.INsTypeDef;
  private readonly errorList: ErrorList;
  private readonly _dispose$ = new Subject<{}>();

  public readonly uri: t.INsUri;
  public readonly state: TypedSheetState<T>;
  public readonly dispose$ = this._dispose$.asObservable();
  public readonly events$: Observable<t.TypedSheetEvent>;

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
    return this.errorList.list;
  }

  public get types() {
    return this.typeDef.columns;
  }

  /**
   * [Methods]
   */

  public cursor(range?: string) {
    this.throwIfDisposed('cursor');
    const ns = this.uri;
    const ctx = this.ctx;
    const types = this.types;
    return TypedSheetCursor.create<T>({ ns, types, ctx, range });
  }

  public toString() {
    return `[Sheet ${this.uri.toString()}]`;
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
