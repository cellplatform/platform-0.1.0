import { take } from 'rxjs/operators';
import * as t from '../types';
import { value } from '../common';

type Ref = { db: t.IDb; network: t.INetwork; dir: string; version?: string };
type Refs = { [key: string]: Ref };

/**
 * A factory for creating and caching database instances.
 */
export class Factory<P extends {}, D extends t.IDb<P>, N extends t.INetwork> {
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
  constructor(args: { create: t.CreateDatabase }) {
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
    const key = Factory.cacheKey(args);
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
  public create = async (args: t.ICreateDatabaseArgs & { cache?: boolean }) => {
    const res = await this._create<P>(args);
    const { db, network } = res;

    // Update state when DB is disposed.
    const key = Factory.cacheKey(args);
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
  public get = (args: {
    dir: string;
    version?: string;
  }): t.ICreateDatabaseResponse<P> | undefined => {
    const key = Factory.cacheKey(args);
    const ref = this._cache[key];
    if (!ref) {
      return undefined;
    }
    const db = ref.db as D;
    const network = ref.network as N;
    return { db, network };
  };

  /**
   * Gets or creates a new DB/Network instance.
   */
  public getOrCreate = async (args: t.ICreateDatabaseArgs & { cache?: boolean }) => {
    return (this.get(args) || (await this.create(args))) as t.ICreateDatabaseResponse<P>;
  };
}
