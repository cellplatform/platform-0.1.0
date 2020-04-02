import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { TypeCache } from '../TypeCache';
import { t, Uri, R } from './common';

export type IStateArgs = {
  events$: t.Subject<t.TypedSheetEvent>;
  fetch: t.ISheetFetcher;
  cache?: t.IMemoryCache;
};

/**
 * State machine for a strongly-typed sheet.
 */
export class TypedSheetState<T> implements t.ITypedSheetState<T> {
  public static create<T>(args: IStateArgs) {
    return new TypedSheetState<T>(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IStateArgs) {
    this.fetch = TypeCache.fetch(args.fetch, { cache: args.cache });

    this._events$ = args.events$;
    this.events$ = this._events$.asObservable().pipe(takeUntil(this._dispose$), share());

    this.change$ = this.events$.pipe(
      filter(e => e.type === 'SHEET/change'),
      map(e => e.payload as t.ITypedSheetChange),
    );

    this.changed$ = this.events$.pipe(
      filter(e => e.type === 'SHEET/changed'),
      map(e => e.payload as t.ITypedSheetStateChange),
    );

    this.change$.subscribe(e => this.onChange(e));
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private _changes: t.ITypedSheetStateChanges = {};
  public readonly fetch: t.CachedFetcher;

  private readonly _dispose$ = new t.Subject<{}>();
  public readonly dispose$ = this._dispose$.asObservable();

  private readonly _events$: t.Subject<t.TypedSheetEvent>;
  private readonly events$: t.Observable<t.TypedSheetEvent>;

  public readonly change$: t.Observable<t.ITypedSheetChange>;
  public readonly changed$: t.Observable<t.ITypedSheetStateChange>;

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get changes(): t.ITypedSheetStateChanges {
    return { ...this._changes };
  }

  /**
   * [Internal]
   */
  private fire(e: t.TypedSheetEvent) {
    this._events$.next(e);
  }

  private async fireChanged<D>(args: { uri: string; to: D; fetch: () => Promise<D> }) {
    const { uri, to } = args;

    const existing = this._changes[args.uri];
    if (existing && R.equals(existing.to, to)) {
      return; // No change.
    }

    const from = (existing ? existing.from : await args.fetch()) || {};

    const payload: t.ITypedSheetStateChange = { uri, from, to };
    this._changes = { ...this._changes, [uri]: payload };
    this.fire({ type: 'SHEET/changed', payload });
  }

  private async onChange(e: t.ITypedSheetChange) {
    const uri = Uri.parse(e.uri);
    const { type, ok } = uri;
    if (!ok) {
      throw new Error(`Cannot process change for '${e.uri}'. Invalid URI.`);
    }
    if (type === 'CELL') {
      const { key, ns } = uri.parts as t.ICellUri;
      await this.fireChanged({
        uri: e.uri,
        to: e.data as t.ICellData,
        fetch: async () => (await this.fetch.getCells({ ns, query: `${key}:${key}` }))[key],
      });
    }
    if (type === 'ROW') {
      // const { key, ns } = uri.parts as t.IRowUri;
      // console.log('key', key);
      // await this.fireChanged({
      //   uri: e.uri,
      //   to: e.data as t.IRowData,
      //   fetch: async () => (await this.fetch.getRows({ ns, query: `${key}:${key}` }))[key],
      // });
    }
  }
}
