import { filter, map, share, takeUntil } from 'rxjs/operators';

import { TypeCache } from '../../TypeSystem.core';
import { deleteUndefined, R, Schema, t, Uri } from './common';

export type IArgs = {
  sheet: t.ITypedSheet;
  event$: t.Subject<t.TypedSheetEvent>;
  fetch: t.ISheetFetcher;
  cache?: t.IMemoryCache;
};

export type TypedSheetStateInternal = t.ITypedSheetState & {
  getNs(): Promise<t.INsProps | undefined>;
  getCell(key: string): Promise<t.ICellData | undefined>;
};

/**
 * State machine for a strongly-typed sheet.
 */
export class TypedSheetState implements t.ITypedSheetState {
  public static create(args: IArgs) {
    return new TypedSheetState(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IArgs) {
    this._sheet = args.sheet;
    this._event$ = args.event$;
    const fetch = TypeCache.fetch(args.fetch, { cache: args.cache });

    // INTERCEPT: Return pending changes to cells from the fetch method.
    const getCells: t.FetchSheetCells = async args => {
      const res = await fetch.getCells(args);
      const cellChanges = this._changes.cells || {};
      const keys = Object.keys(cellChanges);
      if (keys.length > 0) {
        const cells = (res.cells = { ...(res.cells || {}) });
        keys
          .filter(key => Schema.coord.cell.isCell(key) && cells[key])
          .forEach(key => (cells[key] = { ...cellChanges[key].to }));
      }
      return res;
    };

    // INTERCEPT: Return pending changes to the namespace from the fetch method.
    const getNs: t.FetchSheetNs = async args => {
      const ns = this._changes.ns?.to;
      return ns ? { ns } : fetch.getNs(args);
    };

    this.fetch = { ...fetch, getCells, getNs };
    this.event$ = this._event$.pipe(takeUntil(this._dispose$), share());

    this.change$ = this.event$.pipe(
      takeUntil(this.dispose$),
      filter(e => e.type === 'SHEET/change'),
      map(e => e.payload as t.ITypedSheetChange),
      filter(e => this.isWithinNamespace(e.ns)),
      share(),
    );

    this.changed$ = this.event$.pipe(
      takeUntil(this.dispose$),
      filter(e => e.type === 'SHEET/changed'),
      map(e => e.payload as t.ITypedSheetChanged),
      filter(e => this.isWithinNamespace(e.sheet.uri.toString())),
      share(),
    );

    this.change$
      .pipe(
        filter(e => e.kind === 'CELL'),
        map(e => e as t.ITypedSheetChangeCell),
        map(({ to, ns, key }) => ({ to, uri: Uri.parse<t.ICellUri>(Uri.create.cell(ns, key)) })),
        filter(e => e.uri.ok && e.uri.type === 'CELL'),
      )
      .subscribe(({ uri, to }) => this.fireCellChanged({ uri: uri.parts, to }));

    this.change$
      .pipe(
        filter(e => e.kind === 'NS'),
        map(({ to, ns }) => ({ to, uri: Uri.parse<t.INsUri>(ns) })),
        filter(e => e.uri.ok && e.uri.type === 'NS'),
      )
      .subscribe(({ to }) => this.fireNsChanged({ to }));
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private _changes: t.ITypedSheetStateChanges = {};
  private readonly _dispose$ = new t.Subject<{}>();
  private readonly _event$: t.Subject<t.TypedSheetEvent>;
  private readonly _sheet: t.ITypedSheet;

  public readonly fetch: t.CachedFetcher;
  public readonly dispose$ = this._dispose$.pipe(share());
  public readonly event$: t.Observable<t.TypedSheetEvent>;
  public readonly change$: t.Observable<t.ITypedSheetChange>;
  public readonly changed$: t.Observable<t.ITypedSheetChanged>;

  /**
   * [Properties]
   */
  public get uri() {
    return this._sheet.uri;
  }

  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get changes(): t.ITypedSheetStateChanges {
    const changes = this._changes;
    return deleteUndefined({
      ns: changes.ns ? { ...changes.ns } : undefined,
      cells: changes.cells ? { ...changes.cells } : undefined,
    });
  }

  public get hasChanges() {
    const changes = this._changes;
    if (changes.ns) {
      return true;
    }
    if (changes.cells && Object.keys(changes.cells).length > 0) {
      return true;
    }
    return false;
  }

  /**
   * [Methods]
   */

  public async getNs() {
    const ns = this.uri.id;
    return (await this.fetch.getNs({ ns })).ns;
  }

  public async getCell(key: string) {
    if (!Schema.coord.cell.isCell(key)) {
      throw new Error(`Expected a cell key (eg "A1").`);
    }

    const cellChanges = this._changes.cells || {};
    if (cellChanges[key]) {
      return cellChanges[key].to;
    }

    const ns = this.uri.id;
    const query = `${key}:${key}`;
    const res = await this.fetch.getCells({ ns, query });
    return (res.cells || {})[key];
  }

  public clearChanges(action: t.ITypedSheetChangesCleared['action']) {
    const sheet = this._sheet;
    const ns = this.uri.toString();
    const from = { ...this._changes };
    const to = {};
    this._changes = {}; // NB: resetting state happens after the `from` variable is copied.
    this.fire({
      type: 'SHEET/changes/cleared',
      payload: { sheet, from, to, action },
    });
  }

  public clearCache() {
    const ns = this.uri.id;
    const fetch = this.fetch;
    const cache = fetch.cache;
    const prefix = {
      ns: fetch.cacheKey('getNs', ns),
      cells: fetch.cacheKey('getCells', ns),
    };
    cache.keys
      .filter(key => key.startsWith(prefix.cells) || key.startsWith(prefix.ns))
      .forEach(key => cache.delete(key));
  }

  /**
   * [INTERNAL]
   */
  private fire(e: t.TypedSheetEvent) {
    this._event$.next(e);
  }

  private async fireNsChanged<D>(args: { to: D }) {
    const { to } = args;

    const existing = this._changes.ns;
    if (existing && R.equals(existing.to, to)) {
      return; // No change.
    }

    const from = (existing ? existing.from : await this.getNs()) || {};
    const change: t.ITypedSheetChangeNsDiff = {
      kind: 'NS',
      ns: this.uri.toString(),
      from,
      to,
    };

    this._changes = { ...this._changes, ns: change };
    this.fireChanged({ change });
  }

  private async fireCellChanged<D>(args: { uri: t.ICellUri; to: D }) {
    const { uri, to } = args;
    const key = args.uri.key;

    const existing = (this._changes.cells || {})[key];
    if (existing && R.equals(existing.to, to)) {
      return; // No change.
    }

    const ns = Uri.create.ns(uri.ns);
    const from = (existing ? existing.from : await this.getCell(uri.key)) || {};
    const change: t.ITypedSheetChangeCellDiff = {
      kind: 'CELL',
      ns,
      key,
      from,
      to,
    };

    const cells = { ...(this._changes.cells || {}), [key]: change };
    this._changes = { ...this._changes, cells };
    this.fireChanged({ change });
  }

  private fireChanged(args: { change: t.ITypedSheetChangeDiff }) {
    const { change } = args;
    this.fire({
      type: 'SHEET/changed',
      payload: {
        sheet: this._sheet,
        change,
        changes: this.changes,
      },
    });
  }

  private isWithinNamespace(input: string) {
    const text = (input || '').trim();
    const ns = this.uri;
    if (text.startsWith('ns:')) {
      return text === ns.toString();
    }
    if (text.startsWith('cell:')) {
      return text.startsWith(`cell:${ns.id}:`);
    }
    return false;
  }
}
