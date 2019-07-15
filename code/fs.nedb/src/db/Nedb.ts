import * as DocumentStore from 'nedb';

// NB: Hack import because [parceljs] has problem importing using typescript `import` above.
const NedbStore = require('nedb');

export type IStoreArgs = string | Nedb.DataStoreOptions;

/**
 * [INTERNAL]
 *    A promise-based wrapper around the `nedb` library.
 *    Used internally by ther classes for cleaner async/await flow.
 */
export class Nedb<G = any> {
  /**
   * [Static]
   */
  public static create<G = any>(args: IStoreArgs = {}) {
    return new Nedb<G>(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IStoreArgs) {
    this.filename = typeof args === 'string' ? args : args.filename;
    this.store = new NedbStore(args);
  }

  /**
   * [Fields]
   */
  public store: DocumentStore; // NB: Do not access this externally.
  public filename: string | undefined;

  /**
   * [Methods]
   */
  public insert<T extends G>(doc: T) {
    return new Promise<T>((resolve, reject) => {
      this.store.insert(doc, (err: Error, doc: T) => {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    });
  }

  public insertMany<T extends G>(docs: T[]) {
    return this.insert<any>(docs) as Promise<T[]>;
  }

  public update<T extends G>(query: T | T[], updates: T | T[], options: Nedb.UpdateOptions = {}) {
    type Response = { total: number; upsert: boolean; docs: T[] };
    return new Promise<Response>((resolve, reject) => {
      this.store.update(
        query,
        updates,
        options,
        (err: Error, total: number, docs: T[], upsert: boolean) => {
          if (err) {
            reject(err);
          } else {
            const res: Response = {
              total,
              upsert: Boolean(upsert),
              docs: docs === undefined ? [] : docs,
            };
            resolve(res);
          }
        },
      );
    });
  }

  public async find<T extends G>(query: any) {
    return new Promise<T[]>((resolve, reject) => {
      this.store.find(query, (err: Error, docs: T[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
    });
  }

  public async findOne<T extends G>(query: any) {
    return new Promise<T>((resolve, reject) => {
      this.store.findOne(query, (err: Error, doc: T) => {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    });
  }

  public ensureIndex(options: Nedb.EnsureIndexOptions) {
    return new Promise<{}>((resolve, reject) => {
      this.store.ensureIndex(options, (err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve({});
        }
      });
    });
  }

  public remove(query: any, options: Nedb.RemoveOptions = {}) {
    type Response = { total: number };
    return new Promise<Response>((resolve, reject) => {
      this.store.remove(query, options, (err: Error, total: number) => {
        if (err) {
          reject(err);
        } else {
          resolve({ total });
        }
      });
    });
  }
}
