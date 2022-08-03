import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { DbUri, defaultValue, t, time, value as valueUtil, keys as keysUtil } from '../common';
import { NedbStore } from '../store';
import { Schema } from './schema';

export type INeDbArgs = {
  filename?: string;
  store?: t.INedbStore;
};

export class NeDb implements t.INeDb {
  /**
   * [Static]
   */
  public static create(args: INeDbArgs = {}) {
    return new NeDb(args);
  }

  private static toTimestamps(doc?: t.IDoc) {
    const createdAt = valueUtil.toNumber(doc ? doc.createdAt : -1);
    const modifiedAt = valueUtil.toNumber(doc ? doc.modifiedAt : -1);
    return { createdAt, modifiedAt };
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: INeDbArgs) {
    const { filename } = args;
    this._args = args;
    this.store = args.store || NedbStore.create<t.IDoc>({ filename, autoload: Boolean(filename) });
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  /**
   * [Fields]
   */
  private readonly _args: INeDbArgs;
  private readonly store: t.INedbStore<t.IDoc>;
  private readonly uri = DbUri.create();
  private readonly schema = Schema.create();

  private readonly _dispose$ = new Subject<void>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.DbEvent>();
  public readonly events$ = this._events$.pipe(share());

  /**
   * [Properties]
   */
  public get sys() {
    const schema = this.schema.sys;
    const sys = {
      timestamps: async () => {
        const res = await this.store.findOne({ _id: schema.timestamps });
        const data: t.IDbTimestamps = res || { createdAt: -1, modifiedAt: -1 };
        const { createdAt, modifiedAt } = data;
        return { createdAt, modifiedAt };
      },
      increment: async () => {
        let timestamps = await sys.timestamps();
        const now = time.now.timestamp;
        timestamps = {
          createdAt: timestamps.createdAt === -1 ? now : timestamps.createdAt,
          modifiedAt: now,
        };
        const query: any = { _id: schema.timestamps };
        await this.store.updateOne(
          query,
          { _id: schema.timestamps, ...timestamps, data: true },
          { upsert: true },
        );
        return timestamps;
      },
    };
    return sys;
  }

  /**
   * [Methods]
   */

  public toString() {
    const filename = NedbStore.formatFilename(this._args.filename);
    return `[db:${filename ? filename : 'memory'}]`;
  }

  public async compact() {
    const store = this.store as NedbStore;
    if (typeof store.compact === 'function') {
      await store.compact();
    }
  }

  public async ensureIndex(options: t.IIndexOptions) {
    const store = this.store as NedbStore;
    if (typeof store.ensureIndex === 'function') {
      await store.ensureIndex(options);
    }
  }

  /**
   * [Get]
   */
  public async get(key: string): Promise<t.IDbValue> {
    this.throwIfDisposed('get');
    return (await this.getMany([key]))[0];
  }
  public async getMany(keys: string[], options: { silent?: boolean } = {}): Promise<t.IDbValue[]> {
    this.throwIfDisposed('getMany');

    // Query the DB.
    const uris = keys.map((key) => this.uri.parse(key));
    const paths = uris.map((uri) => uri.path.dir);
    const docs = await this.store.find({ _id: { $in: paths } });

    /**
     * TODO 🐷
     * - URI. object path
     */

    // Convert items to return data-structures.
    const items = uris.map((uri) => {
      const key = uri.path.dir;
      const doc = docs.find((item) => item._id === uri.path.dir);
      const value = typeof doc === 'object' ? doc.data : undefined;
      const exists = Boolean(value);
      const { createdAt, modifiedAt } = NeDb.toTimestamps(doc);
      const res: t.IDbValue = {
        value,
        props: { key, exists, createdAt, modifiedAt },
      };
      return res;
    });

    // Fire read events.
    if (!options.silent) {
      items.forEach((item) => {
        const { value, props } = item;
        const key = props.key;
        this.fire({
          type: 'DOC/read',
          payload: { action: 'get', key, value, props },
        });
      });
    }

    // Finish up.
    return items;
  }

  public async getValue<T extends t.Json | undefined>(key: string): Promise<T> {
    this.throwIfDisposed('putValue');
    const res = await this.get(key);
    return (res ? res.value : undefined) as T;
  }

  /**
   * [Put]
   */

  public async put(key: string, value?: t.Json, options?: t.IDbPutOptions): Promise<t.IDbValue> {
    this.throwIfDisposed('put');
    return (await this.putMany([{ key, value, ...options }]))[0];
  }
  public async putMany(
    items: t.IDbPutItem[],
    options: { silent?: boolean } = {},
  ): Promise<t.IDbValue[]> {
    this.throwIfDisposed('putMany');
    const now = time.now.timestamp;

    let inserts = items.map((item) => {
      const uri = this.uri.parse(item.key);
      const path = uri.path.dir;
      const createdAt = defaultValue(item.createdAt, now);
      const modifiedAt = defaultValue(item.modifiedAt, now);
      const data = item.value;
      const doc: t.IDoc = { _id: path, data, createdAt, modifiedAt };
      return doc;
    });

    // Check for existing docs that need to updated (rather than inserted).
    const paths = inserts.map((doc) => doc._id);
    const existing = await this.store.find({ _id: { $in: paths } });

    // Perform updates.
    if (existing.length > 0) {
      const updates = inserts.filter((d1) => existing.some((d2) => d2._id === d1._id));
      await Promise.all(
        updates.map((update) => {
          const query: any = { _id: update._id };
          const current = existing.find((doc) => doc._id === update._id);
          const createdAt = current ? current.createdAt : update.createdAt;
          update = { ...update, createdAt, modifiedAt: now };
          return this.store.updateOne(query, update);
        }),
      );

      // Remove the existing updates from the new inserts.
      inserts = inserts.filter((d1) => !existing.some((d2) => d2._id === d1._id));
    }

    // Perform inserts.
    if (inserts.length > 0) {
      await this.store.insertMany(inserts);
      await this.sys.increment();
    }

    // Retrieve result set.
    const result = await this.getMany(
      items.map((item) => item.key),
      { silent: true },
    );

    // Fire events.
    if (!options.silent) {
      result.forEach((item) => {
        const { value, props } = item;
        const key = props.key;
        this.fire({
          type: 'DOC/change',
          payload: { action: 'put', key, value, props },
        });
      });
    }

    // Finish up.
    return result;
  }

  /**
   * [Delete]
   */

  public async delete(key: string, options: { silent?: boolean } = {}): Promise<t.IDbValue> {
    this.throwIfDisposed('delete');
    return (await this.deleteMany([key], options))[0];
  }
  public async deleteMany(
    keys: string[],
    options: { silent?: boolean } = {},
  ): Promise<t.IDbValue[]> {
    this.throwIfDisposed('deleteMany');

    // Remove docs from DB.
    const uris = keys.map((key) => this.uri.parse(key));
    const paths = uris.map((uri) => uri.path.dir);
    const multi = paths.length > 0;
    await this.store.remove({ _id: { $in: paths } }, { multi });

    // Prepare result set.
    const result = uris.map((uri) => {
      const key = uri.text;
      const res: t.IDbValue = {
        value: undefined,
        props: { key, exists: false, createdAt: -1, modifiedAt: -1 },
      };
      return res;
    });

    // Fire events.
    if (!options.silent) {
      result.forEach((item) => {
        const { value, props } = item;
        const key = props.key;
        this.fire({
          type: 'DOC/change',
          payload: { action: 'delete', key, value, props },
        });
      });
    }

    // Finish up.
    return result;
  }

  /**
   * [Find]
   */

  public async find(input: string | t.INedbQuery): Promise<t.IDbFindResult> {
    this.throwIfDisposed('find');

    let keys: string[] | undefined;
    let map: t.IDbFindResult['map'] | undefined;
    let error: Error | undefined;
    let list: t.IDbValue[] = [];
    const query = typeof input === 'string' ? { path: input } : input;

    try {
      // Prepare the query.
      const uri = this.uri.parse(query.path);
      const { dir, suffix } = uri.path;

      const pathQuery = () => {
        if (dir === '') {
          if (suffix === '') {
            return undefined;
          }
          if (suffix === '**') {
            return {}; // All documents in DB.
          }
          if (suffix === '*') {
            // Only root level paths (eg "foo" not "foo/bar").
            const $regex = /^([^/]*)$/;
            return { _id: { $regex } };
          }
          return;
        } else {
          const expr = suffix === '**' ? `^${dir}/*` : `^${dir}/([^/]*)$`;
          return { _id: { $regex: new RegExp(expr) } };
        }
      };

      const filterQuery = () => {
        const filter = query.filter;
        return filter ? keysUtil.prefixFilterKeys('data', filter) : undefined;
      };

      const buildQuery = () => {
        const path = pathQuery();
        return path ? { ...path, ...filterQuery() } : undefined;
      };

      // Query the database.
      const q = buildQuery();
      const res = q ? await this.store.find(q) : [];

      // Convert into response list.
      list = res.map((doc) => {
        const key = doc._id;
        const value = doc.data;
        const exists = Boolean(value);
        const { createdAt, modifiedAt } = doc;
        const res: t.IDbValue = {
          value,
          props: { key, exists, createdAt, modifiedAt },
        };
        return res;
      });
    } catch (err: any) {
      error = err;
    }

    // Return data structure.
    const result: t.IDbFindResult = {
      length: list.length,
      list,
      get keys() {
        if (!keys) {
          keys = list.map((item) => item.props.key);
        }
        return keys;
      },
      get map() {
        if (!map) {
          map = list.reduce((acc, next) => ({ ...acc, [next.props.key]: next.value }), {});
        }
        return map;
      },
      error,
    };

    // Finish up.
    return valueUtil.deleteUndefined(result);
  }

  /**
   * [Helpers]
   */
  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because the ${this.toString()} has been disposed.`);
    }
  }

  private fire(e: t.DbEvent) {
    this._events$.next(e);
  }
}
