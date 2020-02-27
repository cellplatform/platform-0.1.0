import { Observable, Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import { defaultValue, Schema, t } from './common';
import { fetcher } from './util';
import { TypeClient } from './TypeClient';
import { TypedSheetCursor } from './TypedSheetCursor';

type ISheetArgs = {
  ns: string; // "ns:<uri>"
  fetch: t.ISheetFetcher;
  events$?: t.Subject<t.TypedSheetEvent>;
};

const fromClient = (client: string | t.IHttpClient) => {
  const fetch = fetcher.fromClient({ client });
  return {
    load: <T>(ns: string) => TypedSheet.load<T>({ fetch, ns }),
  };
};

const prependNs = (input: string) => {
  return input.includes(':') ? input : `ns:${input}`;
};

/**
 * Represents a namespace as a logical sheet of cells.
 */
export class TypedSheet<T> implements t.ITypedSheet<T> {
  public static client = fromClient;

  public static async load<T>(args: ISheetArgs) {
    const res = await args.fetch.getType({ ns: prependNs(args.ns) });
    if (res.error) {
      throw new Error(res.error.message);
    }

    const type = res.type;
    const ns = (type.implements || '').trim();
    if (!ns) {
      const err = `The namespace [${args.ns}] does not contain an "implements" type reference.`;
      throw new Error(err);
    }

    const typeNs = Schema.uri.create.ns(ns);
    return new TypedSheet<T>({ ...args, typeNs }).load();
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: ISheetArgs & { typeNs: string }) {
    this.fetch = args.fetch;
    this.uri = args.ns;
    this.type = TypeClient.create({ fetch: args.fetch, ns: args.typeNs });
    this._events$ = args.events$ || new Subject<t.TypedSheetEvent>();
    this.events$ = this._events$.asObservable().pipe(takeUntil(this._dispose$), share());
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private readonly fetch: t.ISheetFetcher;
  public readonly type: t.ITypeClient;
  public readonly uri: string;

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.asObservable();

  private readonly _events$: Subject<t.TypedSheetEvent>;
  public readonly events$: Observable<t.TypedSheetEvent>;

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get ok() {
    this.throwIfDisposed('ok');
    return this.type.ok;
  }

  public get types() {
    this.throwIfDisposed('types');
    return this.type.types;
  }

  /**
   * [Methods]
   */
  public async load() {
    this.throwIfDisposed('load');
    await this.type.load();
    return this as t.ITypedSheet<T>;
  }

  public async cursor(args: { index?: number; take?: number } = {}) {
    this.throwIfDisposed('cursor');
    const ns = this.uri;
    const fetch = this.fetch;
    const types = this.types;
    const index = Math.max(0, defaultValue(args.index, 0));
    const events$ = this._events$;
    const { take } = args;
    return TypedSheetCursor.load<T>({ ns, fetch, types, index, take, events$ });
  }

  /**
   * [Helpers]
   */
  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because [TypedSheet] is disposed.`);
    }
  }
}
