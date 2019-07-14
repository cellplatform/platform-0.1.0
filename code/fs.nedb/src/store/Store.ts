import * as DocumentStore from 'nedb';

// NB: Hack import because [parceljs] has problem importing using typescript `import` above.
const NedbStore = require('nedb');

export type IStoreArgs = string | Nedb.DataStoreOptions;

/**
 * [INTERNAL]
 *    A promise-based wrapper around the `nedb` library.
 *    Used internally by ther classes for cleaner async/await flow.
 */
export class Store<G = any> {
  /**
   * [Static]
   */
  public static create<G = any>(args: IStoreArgs = {}) {
    return new Store<G>(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IStoreArgs) {
    this.store = new NedbStore(args);
  }

  /**
   * [Fields]
   */
  public store: DocumentStore; // NB: Do not access this externally.

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
}
