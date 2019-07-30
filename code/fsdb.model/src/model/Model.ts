import { Subject } from 'rxjs';
import { filter, share, take, takeUntil } from 'rxjs/operators';
import { defaultValue, t } from './common';

export type IModelArgs<P extends object, L extends t.ILinkedModelSchema = any> = {
  db: t.IDb;
  path: string;
  load?: boolean;
  events$?: Subject<t.ModelEvent>;
  links?: t.ILinkedModelResolvers<P, L>;
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
export class Model<P extends object, L extends t.ILinkedModelSchema = any>
  implements t.IModel<P, L> {
  /**
   * [Lifecycle]
   */
  public static create = <P extends object, L extends t.ILinkedModelSchema = any>(
    args: IModelArgs<P, L>,
  ) => new Model<P, L>(args);

  private constructor(args: IModelArgs<P, L>) {
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
  private _args: IModelArgs<P, L>;
  private _item: t.IDbValue | undefined;
  private _links: t.ILinkedModels<L>;
  private _linkCache = {};

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

  public get db() {
    return this._args.db;
  }

  public get path() {
    return this._args.path;
  }

  public get isReady() {
    return Boolean(this._item);
  }

  public get ready() {
    return new Promise<t.IModel<P, L>>(resolve => {
      if (this.isReady) {
        resolve(this);
      } else {
        this.events$
          .pipe(filter(e => e.type === 'MODEL/loaded/data', take(1)))
          .subscribe(e => resolve(this));
      }
    });
  }

  public get exists() {
    return this._item ? this._item.props.exists : undefined;
  }

  public get createdAt() {
    return this._item ? this._item.props.createdAt : -1;
  }

  public get modifiedAt() {
    return this._item ? this._item.props.modifiedAt : -1;
  }

  public get doc(): t.IJsonMap {
    const item = this._item;
    const res = item ? ((item.value as unknown) as P) : undefined;
    return (res || {}) as t.IJsonMap;
  }

  public get props(): P {
    // TEMP 🐷- Build dynamic read/write property object from doc
    return this.doc as P;
  }

  public get links(): t.ILinkedModels<L> {
    if (!this._links) {
      this._links = {} as any;
      const links = (this._args.links || {}) as t.ILinkedModelResolvers<P, L>;
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
    prop: string,
    resolver: t.LinkedModelResolver<P, L>,
    options: { autoLoad?: boolean } = {},
  ) {
    const cached = this._linkCache[prop];
    if (cached) {
      return cached;
    }

    if (!this.isReady && defaultValue(options.autoLoad, true)) {
      await this.load();
    }

    const res = !this._item ? undefined : resolver({ prop, model: this, db: this.db });

    this._linkCache[prop] = res;
    this.fire({ type: 'MODEL/loaded/link', payload: { model: this, prop } });
    return res;
  }
}
