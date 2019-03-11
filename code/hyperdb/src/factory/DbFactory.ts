import { Subject } from 'rxjs';
import { filter, share, take, takeUntil } from 'rxjs/operators';

import { value } from '../common';
import * as t from '../types';

type Ref = { db: t.IDb; network: t.INetwork; dir: string; version?: string };
type Refs = { [key: string]: Ref };

/**
 * A factory for creating and caching database instances.
 */
export class DbFactory<D extends t.IDb = t.IDb, N extends t.INetwork = t.INetwork>
  implements t.IDbFactory<D, N> {
  /**
   * [Static]
   */
  public static cacheKey(args: { dir: string; version?: string }) {
    const { dir, version } = args;
    return version ? `${dir}/ver:${version}` : dir;
  }

  /**
   * [Constructor]
   */
  constructor(args: { create: t.CreateDatabase<D, N> }) {
    this._create = args.create;
  }

  /**
   * [Fields]
   */
  private readonly _create: t.CreateDatabase<D, N>;
  private _afterCreate: Array<t.AfterCreate<D, N>> = [];
  private readonly _cache: Refs = {};
  private readonly _events$ = new Subject<t.DbFactoryEvent>();
  public readonly events$ = this._events$.pipe(share());

  /**
   * [Properties]
   */
  public get count() {
    return Object.keys(this._cache).length;
  }

  public get items(): Array<t.IDbFactoryItem<D, N>> {
    const cache = this._cache;
    return Object.keys(cache)
      .map(key => cache[key])
      .map(({ db, network }) => {
        return { db: db as D, network: network as N };
      });
  }

  /**
   * [Methods]
   */

  /**
   * Determines if the specified DB/Network has been created and exists in the cache.
   */
  public isCached = (args: { dir: string; version?: string }) => {
    const key = DbFactory.cacheKey(args);
    return Boolean(this._cache[key]);
  };

  /**
   * Clears the cache, disposing of all items.
   */
  public reset() {
    Object.keys(this._cache).forEach(key => this._cache[key].db.dispose());
    this.fireChange('RESET');
    return this;
  }

  /**
   * Creates a new DB and network connection.
   */
  public create = async <P extends {} = any>(args: t.ICreateCacheableDatabaseArgs) => {
    const res = await this._create<P>(args);
    const db = res.db as D;
    const network = res.network as N;

    // Update state when DB is disposed.
    const key = DbFactory.cacheKey(args);
    db.dispose$.pipe(take(1)).subscribe(e => {
      network.dispose();
      this.remove(args);
    });

    // Store a reference in cache.
    if (value.defaultValue(args.cache, true)) {
      const { dir, version } = args;
      this._cache[key] = { dir, version, db, network };
    }

    // Invoke the AFTER creation callback.
    if (this._afterCreate) {
      await Promise.all(this._afterCreate.map(handler => handler({ args, db, network })));
    }

    // Alert listeners.
    this._events$.next({
      type: 'DB_FACTORY/created',
      payload: { db, network },
    });
    this.fireChange('CREATED');

    // Finish up.
    return res;
  };

  /**
   * Registers a handler that is run after creation of a new DB/Network.
   */
  public afterCreate(handler: t.AfterCreate<D, N>) {
    this._afterCreate = [...this._afterCreate, handler];
    return this;
  }

  /**
   * Gets an existing DB/Network instance.
   */
  public get = <P extends {} = any>(args: {
    dir: string;
    version?: string;
  }): t.ICreateDatabaseResponse<P> | undefined => {
    const key = DbFactory.cacheKey(args);
    const ref = this._cache[key];
    if (!ref) {
      return undefined;
    }
    const db = ref.db;
    const network = ref.network;
    return { db, network };
  };

  /**
   * Removes an item from the cache.
   */
  public remove(args: { dir: string; version?: string }) {
    const ref = this.get(args);
    if (ref) {
      const { db, network } = ref;
      const key = DbFactory.cacheKey(args);
      delete this._cache[key];
      this._events$.next({
        type: 'DB_FACTORY/created',
        payload: { db, network },
      });
      this.fireChange('REMOVED');
    }
    return this;
  }

  /**
   * Gets or creates a new DB/Network instance.
   */
  public getOrCreate = async <P extends {} = any>(args: t.ICreateCacheableDatabaseArgs) => {
    return (this.get<P>(args) || (await this.create<P>(args))) as t.ICreateDatabaseResponse<P>;
  };

  /**
   * [INTERNAL]
   */

  private fireChange(action: t.IDbFactoryChangeEvent['payload']['action']) {
    this._events$.next({
      type: 'DB_FACTORY/change',
      payload: { action, count: this.count },
    });
  }
}
