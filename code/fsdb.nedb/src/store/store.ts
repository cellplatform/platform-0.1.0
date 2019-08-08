import * as DocumentStore from 'nedb';
import { t, defaultValue, keys } from '../common';

// NB: Hack import because [parceljs] has problem importing using typescript `import` above.
const Nedb = require('nedb');

/**
 * [INTERNAL]
 *    A promise-based wrapper around the `nedb` library.
 *    Used internally by ther classes for cleaner async/await flow.
 */
export class NedbStore<G = any> implements t.INedbStore<G> {
  /**
   * [Static]
   */
  public static create<G = any>(args: t.INedbStoreArgs = {}) {
    return new NedbStore<G>(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: t.INedbStoreArgs) {
    // Format the filename.
    let filename = typeof args === 'string' ? args : args.filename;
    filename = filename ? filename.replace(/^nedb\:/, '') : filename;
    this.filename = filename;

    // Construct the underlying data-store.
    const config = typeof args === 'object' ? args : {};
    const autoload = Boolean(filename) ? config.autoload : false;
    this.store = new Nedb({
      filename,
      autoload,
      onload: this.onload,
    });
  }

  private onload = (err: Error) => {
    if (err) {
      throw err;
    }
    this.isFileLoaded = true;
  };

  /**
   * [Fields]
   */
  private store: DocumentStore;
  public readonly filename: string | undefined;
  public isFileLoaded = false;

  /**
   * [Methods]
   */
  public compact() {
    return new Promise((resolve, reject) => {
      this.store.once('compaction.done', () => resolve());
      this.store.persistence.compactDatafile();
    });
  }

  public loadFile() {
    return new Promise((resolve, reject) => {
      if (this.isFileLoaded || !this.filename) {
        return resolve();
      }
      this.store.loadDatabase(err => {
        if (err) {
          reject(err);
        } else {
          this.isFileLoaded = true;
          resolve();
        }
      });
    });
  }

  public async ensureFileLoaded() {
    if (this.filename && !this.isFileLoaded) {
      await this.loadFile();
    }
  }

  /**
   * [INedbStore]
   */
  public insert<T extends G>(doc: T, options: { escapeKeys?: boolean } = {}) {
    return new Promise<T>(async (resolve, reject) => {
      await this.ensureFileLoaded();
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

  public insertMany<T extends G>(docs: T[], options: { escapeKeys?: boolean } = {}) {
    return this.insert<any>(docs, options) as Promise<T[]>;
  }

  public updateOne<T extends G>(query: T, update: T, options: t.INedbStoreUpdateOptions = {}) {
    return new Promise<t.INedbStoreUpdateResponse<T>>(async (resolve, reject) => {
      await this.ensureFileLoaded();
      this.store.update(
        query,
        update,
        { ...options, returnUpdatedDocs: true },
        (err: Error, total: number, doc: T, upsert: boolean) => {
          if (err) {
            reject(err);
          } else {
            const modified = total > 0;
            resolve({ modified, upsert: Boolean(upsert), doc });
          }
        },
      );
    });
  }

  public async find<T extends G>(query: any) {
    return new Promise<T[]>(async (resolve, reject) => {
      await this.ensureFileLoaded();
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
    return new Promise<T>(async (resolve, reject) => {
      await this.ensureFileLoaded();
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

  public ensureIndex(options: t.INedbEnsureIndexOptions) {
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

  public remove(query: any, options: t.INedbStoreRemoveOptions = {}) {
    return new Promise<t.INedbStoreRemoveResponse>(async (resolve, reject) => {
      await this.ensureFileLoaded();
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
