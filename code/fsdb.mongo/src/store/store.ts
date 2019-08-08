import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { defaultValue, keys, mongodb, t } from '../common';

const MongoClient = mongodb.MongoClient;

export type IMongoStoreArgs = {
  uri: string;
  db: string; // Name.
  collection: string; // Name.
  connect?: boolean;
};

/**
 * [Internal]
 *
 *    A promise-based wrapper around the `nedb` library.
 *    Used internally by for cleaner async/await flow.
 *
 */
export class MongoStore<G = any> implements t.IMongoStore<G> {
  /**
   * [Static]
   */
  public static create<G = any>(args: IMongoStoreArgs) {
    return new MongoStore<G>(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IMongoStoreArgs) {
    const { uri } = args;
    this.client = new MongoClient(uri, { useNewUrlParser: true });
    this._args = args;
    if (args.connect) {
      this.ensureConnected();
    }
  }

  public dispose() {
    this.client.close();
    this.isConnected = false;
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private _args: IMongoStoreArgs;
  private client: mongodb.MongoClient;
  private db: mongodb.Db;
  private collection: mongodb.Collection<G>;
  private isConnected = false;

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  /**
   * [Methods]
   */
  private ensureConnected() {
    this.throwIfDisposed('ensureConnected');
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        return resolve();
      }
      this.client.connect(err => {
        if (err) {
          reject(err);
        }
        this.db = this.client.db(this._args.db);
        this.collection = this.db.collection(this._args.collection);
        this.isConnected = true;
        resolve();
      });
    });
  }

  /**
   * [INedbStore]
   */

  public async insert<T extends G>(doc: T, options: { escapeKeys?: boolean } = {}) {
    this.throwIfDisposed('insert');
    return (await this.insertMany([doc], options))[0];
  }

  /**
   * - https://docs.mongodb.com/manual/reference/method/db.collection.createIndex
   */
  public insertMany<T extends G>(docs: T[], options: { escapeKeys?: boolean } = {}) {
    this.throwIfDisposed('insertMany');
    return new Promise<T[]>(async (resolve, reject) => {
      await this.ensureConnected();
      if (defaultValue(options.escapeKeys, true)) {
        docs = keys.encodeObjectKeys<any>(docs);
      }
      this.collection.insertMany(docs, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.ops);
        }
      });
    });
  }

  /**
   * - https://docs.mongodb.com/manual/reference/method/db.collection.updateOne
   */
  public updateOne<T extends G>(query: any, update: any, options: t.INedbStoreUpdateOptions = {}) {
    this.throwIfDisposed('update');
    return new Promise<t.INedbStoreUpdateResponse<T>>(async (resolve, reject) => {
      await this.ensureConnected();
      this.collection.updateOne(query, { $set: update }, options, (err, res) => {
        if (err) {
          reject(err);
        } else {
          const upsert = res.upsertedCount > 0;
          const modified = upsert ? res.upsertedCount > 0 : res.modifiedCount > 0;
          const doc = upsert ? { ...update, _id: res.upsertedId._id.toString() } : undefined;
          resolve({ modified, upsert, doc });
        }
      });
    });
  }

  /**
   * - https://docs.mongodb.com/manual/reference/method/db.collection.find
   */
  public find<T extends G>(query: any) {
    this.throwIfDisposed('find');
    return new Promise<T[]>(async (resolve, reject) => {
      await this.ensureConnected();
      try {
        const cursor = this.collection.find(query);
        const docs: T[] = [];
        await cursor.forEach((doc: any) => docs.push(doc));
        resolve(docs);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * - https://docs.mongodb.com/manual/reference/method/db.collection.findOne
   */
  public findOne<T extends G>(query: any) {
    this.throwIfDisposed('findOne');
    return new Promise<T | undefined>(async (resolve, reject) => {
      await this.ensureConnected();
      this.collection.findOne(query, (err, res) => {
        if (err) {
          reject(err);
        } else {
          let doc: any = res ? { ...res, _id: (res as any)._id.toString() } : undefined;
          doc = keys.decodeObjectKeys<any>(doc);
          resolve(doc);
        }
      });
    });
  }

  /**
   * - https://docs.mongodb.com/manual/reference/method/db.collection.remove
   */
  public remove(query: any, options: t.INedbStoreRemoveOptions = {}) {
    this.throwIfDisposed('remove');
    return new Promise<{}>(async (resolve, reject) => {
      await this.ensureConnected();
      const { multi } = options;
      const single = !Boolean(multi);
      try {
        await this.collection.remove(query, { single });
        resolve({});
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * [IMongoStoreMethods] specific API for Mongo (extended beyond `nedb`).
   */

  /**
   * Drop the current collection if it exists.
   * - https://docs.mongodb.com/manual/reference/method/db.collection.drop
   */
  public async drop() {
    await this.ensureConnected();
    const exists = await this.exists();
    if (exists) {
      await this.collection.drop();
    }
  }

  /**
   * Determine if the collection exists.
   */
  public async exists() {
    await this.ensureConnected();
    const name = this._args.collection;
    return (await this.db.collections()).some(c => c.collectionName === name);
  }

  /**
   * [Helpers]
   */
  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because MongoStore is disposed.`);
    }
  }
}
