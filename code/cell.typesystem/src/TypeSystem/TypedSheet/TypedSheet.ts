import { Observable, Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import { defaultValue, ERROR, ErrorList, t, Uri, MemoryCache } from '../../common';
import { TypeClient } from '../TypeClient';
import { util } from '../util';
import { TypedSheetCursor } from './TypedSheetCursor';

export type ITypedSheetCtx = {
  fetch: t.ISheetFetcher;
  events$: t.Subject<t.TypedSheetEvent>;
  cache: t.IMemoryCache;
};

const fromClient = (client: t.IHttpClient) => {
  const fetch = util.fetcher.fromClient(client);
  return {
    load: <T>(ns: string) => TypedSheet.load<T>({ fetch, ns }),
  };
};

/**
 * Represents a namespace as a logical sheet of cells.
 */
export class TypedSheet<T> implements t.ITypedSheet<T> {
  public static client = fromClient;

  public static async load<T>(args: {
    ns: string;
    fetch: t.ISheetFetcher;
    events$?: t.Subject<t.TypedSheetEvent>;
    cache?: t.IMemoryCache;
  }) {
    const { fetch, events$, cache } = args;
    const sheetNs = util.formatNs(args.ns);

    // Retrieve type definition for sheet.
    const res = await args.fetch.getType({ ns: sheetNs });
    if (res.error) {
      throw new Error(res.error.message);
    }
    const implementsNs = util.formatNs(res.type.implements);
    if (!implementsNs) {
      const err = `The namespace [${sheetNs}] does not contain an "implements" type reference.`;
      throw new Error(err);
    }

    // Load and parse the type definition.
    const typeNs = Uri.create.ns(implementsNs);
    const typeDef = await TypeClient.load({ ns: typeNs, fetch });

    // Finish up.
    return new TypedSheet<T>({ sheetNs, typeDef, fetch, events$, cache });
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: {
    sheetNs: string;
    typeDef: t.INsTypeDef;
    fetch: t.ISheetFetcher;
    events$?: t.Subject<t.TypedSheetEvent>;
    cache?: t.IMemoryCache;
  }) {
    this.ctx = {
      fetch: args.fetch,
      cache: args.cache || MemoryCache.create(),
      events$: args.events$ || new Subject<t.TypedSheetEvent>(),
    };

    // this.fetch = args.fetch;
    this.uri = args.sheetNs;
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
  private readonly ctx: ITypedSheetCtx;
  // private readonly cache: t.IMemoryCache;
  // private readonly fetch: t.ISheetFetcher;
  private readonly typeDef: t.INsTypeDef;
  private readonly errorList: ErrorList;

  public readonly uri: string;

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.asObservable();

  // private readonly _events$: Subject<t.TypedSheetEvent>;
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
