import * as DocumentStore from 'nedb';
import { defaultValue, keys, R } from '../common';

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
    // Format the filename.
    let filename = typeof args === 'string' ? args : args.filename;
    filename = filename ? filename.replace(/^nedb\:/, '') : filename;
    this.filename = filename;

    // Construct the underlying data-store.
    const config = typeof args === 'object' ? args : {};
    this.store = new NedbStore({ ...config, filename });
  }

  /**
   * [Fields]
   */
  public store: DocumentStore; // NB: Do not access this externally.
  public filename: string | undefined;

  /**
   * [Methods]
   */

  public compact() {
    return new Promise((resolve, reject) => {
      this.store.once('compaction.done', () => resolve());
      this.store.persistence.compactDatafile();
    });
  }

  public insert<T extends G>(doc: T, options: { escapeKeys?: boolean } = {}) {
    return new Promise<T>((resolve, reject) => {
      const escapeKeys = defaultValue(options.escapeKeys, true);
      if (escapeKeys) {
        doc = keys.encodeObjectKeys<any>(doc);
      }

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
          docs = keys.decodeObjectKeys<any>(docs);

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
          doc = keys.decodeObjectKeys<any>(doc);
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
