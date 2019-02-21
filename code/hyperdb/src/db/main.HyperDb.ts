import { IFeed } from '../types';

/**
 * Promise based wrapper around a HyperDB instance.
 *
 * See:
 *  - https://github.com/mafintosh/hyperdb#api
 *
 */
export class HyperDb {
  private _db: any;

  /**
   * Constructor.
   */
  constructor(args: { instance: any }) {
    this._db = args.instance;
  }

  /**
   * [Properties]
   */
  public get key(): Buffer {
    return this._db.key;
  }

  public get discoveryKey(): Buffer {
    return this._db.discoveryKey;
  }

  public get local(): IFeed {
    return this._db.local;
  }

  /**
   * [Methods]
   */
  public replicate(options: { live?: boolean }) {
    const { live = false } = options;
    // const userData = this.local.key;

    // NOTE: Tack userData onto the replicated database.
    //    This is used by the swarm-connection event to filter on peers
    //    that are looking for this database.
    //
    // See:
    //    Swarm connection event listenr.
    //
    // See:
    //    https://github.com/karissa/hyperdiscovery/pull/12#pullrequestreview-95597621
    //
    const userData = this.local.key;

    return this._db.replicate({ live, userData });
  }

  /**
   * Check whether a key is authorized to write to the database.
   */
  public isAuthorized(peerKey: Buffer) {
    return new Promise<boolean>((resolve, reject) => {
      this._db.authorized(peerKey, (err: Error, result: boolean) => {
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
      this._db.authorize(peerKey, (err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
