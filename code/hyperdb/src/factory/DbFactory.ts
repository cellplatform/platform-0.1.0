import { Subject } from 'rxjs';
import { map, filter, share, take, takeUntil } from 'rxjs/operators';

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

  public static create<D extends t.IDb = t.IDb, N extends t.INetwork = t.INetwork>(args: {
    create: t.CreateDatabase<D, N>;
  }) {
    return new DbFactory<D, N>(args);
  }

  /**
   * [Constructor]
   */
  private constructor(args: { create: t.CreateDatabase<D, N>; cache?: Refs }) {
    this._.create = args.create;
    this._.cache = { ...(args.cache || {}) };
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    create: (undefined as unknown) as t.CreateDatabase<D, N>,
    cache: (undefined as unknown) as Refs,
    events$: new Subject<t.DbFactoryEvent>(),
  };

  public readonly events$ = this._.events$.pipe(share());
  public readonly creating$ = this.events$.pipe(
    filter(e => e.type === 'DB_FACTORY/creating'),
    map(e => e.payload as t.ICreateDatabaseArgs),
    share(),
  );
  public readonly created$ = this.events$.pipe(
    filter(e => e.type === 'DB_FACTORY/created'),
    map(e => e.payload as t.IDbFactoryCreated),
    share(),
  );

  /**
   * [Properties]
   */
  public get count() {
    return Object.keys(this._.cache).length;
  }

  public get items(): Array<t.IDbFactoryItem<D, N>> {
    const cache = this._.cache;
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
    return Boolean(this._.cache[key]);
  };

  /**
   * Clears the cache, disposing of all items.
   */
  public reset() {
    Object.keys(this._.cache).forEach(key => this._.cache[key].db.dispose());
    this.fireChange('RESET');
    return this;
  }

  /**
   * Creates a new DB and network connection.
   */
  public create = async <P extends {} = any>(args: t.ICreateCacheableDatabaseArgs) => {
    args = this.fireCreating(args);
    return this._create(args);
  };

  private _create = async <P extends {} = any>(args: t.ICreateCacheableDatabaseArgs) => {
    const res = await this._.create<P>(args);
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
      this._.cache[key] = { dir, version, db, network };
    }

    // Fire AFTER event.
    this.fire({
      type: 'DB_FACTORY/created',
      payload: { args, db, network },
    });
    this.fireChange('CREATED');

    // Finish up.
    return res;
  };

  /**
   * Creates a new instance of the factory cache retaining current cached state.
   */
  public clone() {
    return new DbFactory<D, N>({ create: this._.create, cache: this._.cache });
  }

  /**
   * Gets an existing DB/Network instance.
   */
  public get = <P extends {} = any>(args: {
    dir: string;
    version?: string;
  }): t.ICreateDatabaseResponse<P> | undefined => {
    const key = DbFactory.cacheKey(args);
    const ref = this._.cache[key];
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
      delete this._.cache[key];
      this.fire({
        type: 'DB_FACTORY/removed',
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
    // NB:  Fire the PRE "creating" event in case any listeners adjust the input args (eg. the 'dir')
    //      so as to ensure the correct cache item is looked up.
    args = this.fireCreating(args);

    return (this.get<P>(args) || (await this._create<P>(args))) as t.ICreateDatabaseResponse<P>;
  };

  /**
   * [INTERNAL]
   */

  private fire(e: t.DbFactoryEvent) {
    this._.events$.next(e);
  }

  private fireChange(action: t.IDbFactoryChangeEvent['payload']['action']) {
    this.fire({
      type: 'DB_FACTORY/change',
      payload: { action, count: this.count },
    });
  }

  private fireCreating(args: t.ICreateCacheableDatabaseArgs) {
    args = { ...args };
    this.fire({
      type: 'DB_FACTORY/creating',
      payload: args,
    });
    return args;
  }
}
