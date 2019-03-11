import { take } from 'rxjs/operators';
import * as t from '../types';
import { value } from '../common';

type Ref = { db: t.IDb; network: t.INetwork; dir: string; version?: string };
type Refs = { [key: string]: Ref };

/**
 * A factory for creating and caching database instances.
 */
export class DbFactory<D extends t.IDb, N extends t.INetwork> implements t.IDbFactory<D, N> {
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
  private readonly _create: t.CreateDatabase;
  private readonly _cache: Refs = {};

  /**
   * [Properties]
   */
  public get count() {
    return Object.keys(this._cache).length;
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
  }

  /**
   * Creates a new DB and network connection.
   */
  public create = async <P extends {} = any>(args: t.ICreateCacheableDatabaseArgs) => {
    const res = await this._create<P>(args);
    const { db, network } = res;

    // Update state when DB is disposed.
    const key = DbFactory.cacheKey(args);
    db.dispose$.pipe(take(1)).subscribe(e => {
      delete this._cache[key];
      network.dispose();
    });

    // Store a reference in cache.
    if (value.defaultValue(args.cache, true)) {
      const { dir, version } = args;
      this._cache[key] = { dir, version, db, network };
    }

    return res;
  };

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
   * Gets or creates a new DB/Network instance.
   */
  public getOrCreate = async <P extends {} = any>(args: t.ICreateCacheableDatabaseArgs) => {
    return (this.get<P>(args) || (await this.create<P>(args))) as t.ICreateDatabaseResponse<P>;
  };
}
