import { Observable, Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import { defaultValue, ERROR, ErrorList, MemoryCache, Uri } from '../../common';
import { TypeClient } from '../TypeClient';
import { util } from '../util';
import { TypedSheetCursor } from './TypedSheetCursor';
import * as t from './types';

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
    ns: string | t.INsUri; // Namespace URI.
    fetch: t.ISheetFetcher;
    cache?: t.IMemoryCache;
    events$?: t.Subject<t.TypedSheetEvent>;
  }) {
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
    implements: string; // Namespace URI.
    fetch: t.ISheetFetcher;
    cache?: t.IMemoryCache;
    events$?: t.Subject<t.TypedSheetEvent>;
  }) {
    const { fetch, events$, cache } = args;

    const implementsNs = util.formatNsUri(args.implements);
    const typeDef = await TypeClient.load({
      ns: implementsNs.toString(),
      fetch,
      cache,
    });

    return new TypedSheet<T>({
      sheetNs: Uri.create.ns(Uri.cuid()),
      typeDef,
      fetch,
      events$,
      cache,
    });
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: {
    sheetNs: string | t.INsUri;
    typeDef: t.INsTypeDef;
    fetch: t.ISheetFetcher;
    events$?: t.Subject<t.TypedSheetEvent>;
    cache?: t.IMemoryCache;
  }) {
    const fetch = args.fetch;
    const cache = args.cache || MemoryCache.create();
    const events$ = args.events$ || new Subject<t.TypedSheetEvent>();

    this.ctx = {
      fetch,
      cache,
      events$,
      sheet: {
        load<T>(args: { ns: string }) {
          return TypedSheet.load<T>({ ...args, fetch, cache, events$ });
        },
        create<T>(args: { implements: string }) {
          return TypedSheet.create<T>({ ...args, fetch, cache, events$ });
        },
      },
    };

    this.uri = util.formatNsUri(args.sheetNs);
    this.typeDef = args.typeDef;
    this.events$ = this.ctx.events$.asObservable().pipe(takeUntil(this._dispose$), share());
    this.errorList = ErrorList.create({
      defaultType: ERROR.TYPE.SHEET,
      errors: this.typeDef.errors,
    });
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private readonly ctx: t.SheetCtx;
  private readonly typeDef: t.INsTypeDef;
  private readonly errorList: ErrorList;

  public readonly uri: t.INsUri;

  private readonly _dispose$ = new Subject<{}>();
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

  public async cursor(args: { index?: number; take?: number } = {}) {
    this.throwIfDisposed('cursor');
    const ns = this.uri;
    const ctx = this.ctx;
    const types = this.types;
    const index = Math.max(0, defaultValue(args.index, 0));
    const { take } = args;
    return TypedSheetCursor.load<T>({ ns, types, index, take, ctx });
  }

  /**
   * [Internal]
   */
  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because [TypedSheet] is disposed.`);
    }
  }
}
