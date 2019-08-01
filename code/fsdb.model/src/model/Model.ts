import { Subject } from 'rxjs';
import { filter, share, take, takeUntil } from 'rxjs/operators';
import { defaultValue, t, time } from './common';

export type IModelArgs<P extends object, D extends P = P, L extends t.ILinkedModelSchema = any> = {
  db: t.IDb;
  path: string;
  initial: D;
  load?: boolean;
  events$?: Subject<t.ModelEvent>;
  links?: t.ILinkedModelDefs<L>;
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

  public get isLoaded() {
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
      if (this.isLoaded) {
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
    const length = list.length;
    return {
      length,
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
      Object.keys(this._args.initial).forEach(field => {
        Object.defineProperty(res, field, {
          get: () => {
            return this.isChanged ? this.changes.map[field] || this.doc[field] : this.doc[field];
          },
          set: value => this.changeField('PROP', field, value),
        });
      });
      this._props = res;
    }
    return this._props;
  }

  public get links(): t.ILinkedModels<L> {
    if (!this._links) {
      this._links = {} as any;
      const defs = this._args.links || {};
      Object.keys(defs).forEach(field =>
        Object.defineProperty(this._links, field, {
          get: () => this.resolveLink(field),
        }),
      );
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
      const defs = this._args.links || [];
      fireEvent = cachedLinks.length < defs.length ? true : fireEvent;
      const wait = Object.keys(defs).map(key => this.links[key]);
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
    this.throwIfDisposed('save');
    if (this.exists && !this.isChanged) {
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
    this.throwIfDisposed('toObject');
    if (!this.isLoaded || !this.exists) {
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

  private resolveLink(field: string, options: { autoLoad?: boolean } = {}) {
    const db = this.db;
    const defs = (this._args.links || {}) as t.ILinkedModelDefs<L>;
    const def = defs[field];
    const { relationship } = def;

    const key = def.field || field;
    const isOne = relationship === '1:1' || relationship === '*:1';
    const isMany = relationship === '*:*' || relationship === '1:*';

    if (!def) {
      throw new Error(`A link definition for field '${field}' could not be found.`);
    }

    // Link resolver.
    const promise: any = new Promise<L[keyof L] | undefined>(async (resolve, reject) => {
      const cached = this._linkCache[field];
      if (cached) {
        return resolve(cached);
      }
      if (!this.isLoaded && defaultValue(options.autoLoad, true)) {
        await this.load();
      }

      let model: any;
      if (isOne) {
        const path = this.doc[key] as string;
        model = path ? await def.create({ db, path }).ready : undefined;
      }
      if (isMany) {
        const paths = (this.doc[key] || []) as string[];
        model = await Promise.all(paths.map(path => def.create({ db, path }).ready));
      }
      this._linkCache[field] = model;

      this.fire({ type: 'MODEL/loaded/link', payload: { model: this, field } });
      return resolve(model);
    });

    // Add and remove API for links.
    if (isOne) {
      promise.link = (path: string) => this.changeField('LINK', key, path);
      promise.unlink = () => this.changeField('LINK', key, undefined);
    }
    if (isMany) {
      promise.link = (paths: string[]) => {
        console.log('link', relationship, paths); // TEMP 🐷
      };
      promise.unlink = (paths?: string[]) => {
        console.log('link', relationship, paths); // TEMP 🐷
      };
    }

    // Finish up.
    return promise;
  }

  private changeField(kind: t.ModelChangeKind, field: string, value: any) {
    const changes = this.changes.map;
    if (Object.keys(changes).includes(field) && changes[field] === value) {
      return false;
    } else {
      const payload = this.getChange(kind, field, value);
      this._changes = [...this._changes, payload];
      this.fire({ type: 'MODEL/changed', payload });
      return true;
    }
  }

  private getChange(kind: t.ModelChangeKind, field: string, value: any): t.IModelChange<P, D, L> {
    const to = { ...this.doc, [field]: value };
    const doc = { from: { ...this.doc }, to };
    return {
      kind,
      modifiedAt: time.now.timestamp,
      field,
      value: { from: this.doc[field], to: value },
      doc,
      model: this,
    };
  }
}
