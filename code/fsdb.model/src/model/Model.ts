import { Subject } from 'rxjs';
import { filter, share, take, takeUntil } from 'rxjs/operators';
import { defaultValue, t, time } from './common';

export type IModelArgs<P extends object, D extends P = P, L extends t.ILinkedModelSchema = any> = {
  db: t.IDb;
  path: string;
  initial: P;
  load?: boolean;
  events$?: Subject<t.ModelEvent>;
  links?: t.ILinkedModelResolvers<P, D, L>;
};

/**
 * A strongly typed wrapper around a database representing a
 * single conceptual "model", and it's relationships.
 *
 *  - data
 *  - links (JOIN relationships)
 *  - read/write (change management)
 *  - caching
 *
 */
export class Model<P extends object, D extends P = P, L extends t.ILinkedModelSchema = any>
  implements t.IModel<P, D, L> {
  /**
   * [Lifecycle]
   */
  public static create = <P extends object, D extends P = P, L extends t.ILinkedModelSchema = any>(
    args: IModelArgs<P, D, L>,
  ) => new Model<P, D, L>(args);

  private constructor(args: IModelArgs<P, D, L>) {
    this._args = args;
    if (args.events$) {
      this.events$.subscribe(args.events$); // Bubble events.
    }
    if (defaultValue(args.load, true)) {
      this.load();
    }
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private _args: IModelArgs<P, D, L>;
  private _item: t.IDbValue | undefined;
  private _props: P;
  private _links: t.ILinkedModels<L>;
  private _linkCache = {};
  private _changes: Array<t.IModelChange<P, D, L>> = [];

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.ModelEvent>();
  public readonly events$ = this._events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get isReady() {
    return Boolean(this._item);
  }

  public get isChanged() {
    return (this._changes || []).length > 0;
  }

  public get exists() {
    return this._item ? this._item.props.exists : undefined;
  }

  public get db() {
    return this._args.db;
  }

  public get path() {
    return this._args.path;
  }

  public get ready() {
    return new Promise<t.IModel<P, D, L>>(resolve => {
      if (this.isReady) {
        resolve(this);
      } else {
        this.events$
          .pipe(filter(e => e.type === 'MODEL/loaded/data', take(1)))
          .subscribe(e => resolve(this));
      }
    });
  }

  public get createdAt() {
    return this._item ? this._item.props.createdAt : -1;
  }

  public get modifiedAt() {
    return this._item ? this._item.props.modifiedAt : -1;
  }

  public get changes(): t.IModelChanges<P, D, L> {
    const list = this._changes || [];
    const total = list.length;
    return {
      total,
      list,
      get map() {
        return list.reduce((acc, next) => {
          return { ...acc, [next.field]: next.value.to };
        }, {}) as t.IModelChanges<P, D, L>['map'];
      },
    };
  }

  public get doc(): D {
    const item = this._item;
    const res = item ? ((item.value as unknown) as P) : undefined;
    return (res || {}) as D;
  }

  public get props(): P {
    if (!this._props) {
      const res = {} as any;
      Object.keys(this._args.initial).forEach(key => {
        Object.defineProperty(res, key, {
          get: () => {
            return this.isChanged ? this.changes.map[key] || this.doc[key] : this.doc[key];
          },
          set: value => {
            const payload = this.getChange(key, value);
            this._changes = [...this._changes, payload];
            this.fire({ type: 'MODEL/changed', payload });
          },
        });
      });
      this._props = res;
    }
    return this._props;
  }

  public get links(): t.ILinkedModels<L> {
    if (!this._links) {
      this._links = {} as any;
      const links = (this._args.links || {}) as t.ILinkedModelResolvers<P, D, L>;
      Object.keys(links).forEach(key => {
        Object.defineProperty(this._links, key, {
          get: () => this.getLink(key, links[key].resolve),
        });
      });
    }
    return this._links as t.ILinkedModels<L>;
  }

  /**
   * [Methods]
   */

  /**
   * Loads the model's data from the DB.
   */
  public async load(options: { force?: boolean; withLinks?: boolean } = {}) {
    this.throwIfDisposed('load');
    let fireEvent = false;
    if (options.force) {
      this.reset();
    }

    // Retrieve model data from the DB.
    if (!this._item) {
      this._item = await this.db.get(this.path);
      fireEvent = true;
    }

    // Load links if required.
    const withLinks = Boolean(options.withLinks);
    const cachedLinks = Object.keys(this._linkCache);
    if (withLinks) {
      const links = this._args.links || [];
      fireEvent = cachedLinks.length < links.length ? true : fireEvent;
      const wait = Object.keys(links).map(key => this.links[key]);
      await Promise.all(wait);
    }

    // Alert listeners.
    if (fireEvent) {
      this.fire({ type: 'MODEL/loaded/data', payload: { model: this, withLinks } });
    }

    // Finish up.
    return this.props;
  }

  /**
   * Clears cached model data.
   */
  public reset() {
    this.throwIfDisposed('reset');
    this._item = undefined;
    this._linkCache = {};
  }

  /**
   * Persists changes to the underlying store.
   */
  public async save() {
    if (!this.isChanged) {
      return { saved: false };
    }

    // Save to the DB.
    const changes = this.changes;
    const doc = this.exists
      ? { ...this.doc, ...changes.map }
      : { ...this._args.initial, ...changes.map };
    await this.db.put(this.path, doc as any);

    // Reset the change state.
    this._changes = [];

    // Finish up.
    this.fire({ type: 'MODEL/saved', payload: { model: this, changes } });
    return { saved: true };
  }

  /**
   * Convert the model props to a simple object.
   */
  public toObject(): P {
    if (!this.isReady || !this.exists) {
      return ({} as any) as P;
    }
    const props = this.props;
    return Object.keys(this._args.initial).reduce((acc, key) => {
      acc[key] = props[key];
      return acc;
    }, {}) as P;
  }

  /**
   * [Helpers]
   */
  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because Model is disposed.`);
    }
  }

  private fire(e: t.ModelEvent) {
    this._events$.next(e);
  }

  private async getLink(
    field: string,
    resolver: t.LinkedModelResolver<P, D, L>,
    options: { autoLoad?: boolean } = {},
  ) {
    const cached = this._linkCache[field];
    if (cached) {
      return cached;
    }

    if (!this.isReady && defaultValue(options.autoLoad, true)) {
      await this.load();
    }

    const res = !this._item ? undefined : resolver({ field, model: this, db: this.db });

    this._linkCache[field] = res;
    this.fire({ type: 'MODEL/loaded/link', payload: { model: this, field } });
    return res;
  }

  private getChange(key: string, value: any): t.IModelChange<P, D, L> {
    const to = { ...this.doc, [key]: value };
    const doc = { from: { ...this.doc }, to };
    const isRef = Object.keys(this._args.links || {}).includes(key);
    return {
      kind: isRef ? 'REF' : 'VALUE',
      modifiedAt: time.now.timestamp,
      model: this,
      field: key,
      value: { from: this.doc[key], to: value },
      doc,
    };
  }
}
