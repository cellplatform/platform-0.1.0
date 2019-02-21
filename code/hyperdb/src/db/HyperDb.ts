import * as t from '../types';
const hyperdb = require('hyperdb');

/**
 * Promise based wrapper around a HyperDB instance.
 *
 * See:
 *  - https://github.com/mafintosh/hyperdb#api
 *
 */

export class HyperDb<D extends object = any> {
  /**
   * Factory.
   */
  public static create<D extends object = any>(args: { storage: string; dbKey?: string }) {
    const reduce = (a: any, b: any) => a;
    return new Promise<HyperDb<D>>((resolve, reject) => {
      const { storage, dbKey } = args;
      const options = { valueEncoding: 'utf-8', reduce };
      const db = args.dbKey ? hyperdb(storage, dbKey, options) : hyperdb(storage, options);
      db.on('ready', () => {
        resolve(new HyperDb<D>(db));
      });
    });
  }

  public _ = {
    db: null as any,
  };

  /**
   * [Constructor]
   */
  private constructor(db: any) {
    this._.db = db;
  }

  /**
   * [Properties]
   */
  public get key(): Buffer {
    return this._.db.key;
  }

  public get discoveryKey(): Buffer {
    return this._.db.discoveryKey;
  }

  public get local(): t.IFeed {
    return this._.db.local;
  }

  /**
   * [Methods]
   */
  public replicate(options: { live?: boolean }) {
    const { live = false } = options;

    // NOTE: Tack userData onto the replicated database.
    //    This is used by the swarm-connection event to filter on peers
    //    that are looking for this database.
    //
    // See:
    //    Swarm connection event listener.
    //
    // See:
    //    https://github.com/karissa/hyperdiscovery/pull/12#pullrequestreview-95597621
    //    https://github.com/cblgh/hyperdb-examples
    //
    const userData = this.local.key;

    return this._.db.replicate({ live, userData });
  }

  /**
   * Check whether a key is authorized to write to the database.
   */
  public isAuthorized(peerKey: Buffer) {
    return new Promise<boolean>((resolve, reject) => {
      this._.db.authorized(peerKey, (err: Error, result: boolean) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Authorize a peer to write to the database.
   */
  public async authorize(peerKey: Buffer) {
    return new Promise((resolve, reject) => {
      this._.db.authorize(peerKey, (err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  /**
   * Gets a value from the database.
   */
  public async get<K extends keyof D>(key: K) {
    return new Promise<D[K]>((resolve, reject) => {
      this._.db.get(key, (err: Error, result?: D[K]) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Writes a value to the database.
   */
  public async put<K extends keyof D>(key: K, value: D[K]) {
    return new Promise<D[K]>((resolve, reject) => {
      this._.db.put(key, value, (err: Error, result?: D[K]) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }
}
