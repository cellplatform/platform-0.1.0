import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';
import * as t from '../types';

/**
 * Promise based wrapper around a HyperDB instance.
 *
 * See:
 *  - https://github.com/mafintosh/hyperdb#api
 *
 */
export class HyperDb<D extends object = any> {
  private _ = {
    db: null as any,
    isDisposed: false,
    dispose$: new Subject(),
    events$: new Subject<t.DbEvent>(),
  };

  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * Constructor.
   */
  constructor(args: { instance: any }) {
    this._.db = args.instance;
    this.dispose$.subscribe(() => (this._.isDisposed = true));
  }

  public dispose() {
    this._.dispose$.next();
  }

  public get isDisposed() {
    return this._.isDisposed;
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

    console.log('live ||||||||||', live);

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
    // const userData = this.discoveryKey;
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
        // console.log('this._.db', this._.db);
        // console.log('GET  >> ', key, result);
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
        // console.log('result', result);
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }

  /**
   * [INTERNAL]
   */
  private fireError(error: Error) {
    this.next<t.DbEvent>('DB/error', { error });
  }

  private next<E extends t.DbEvent>(type: E['type'], payload: E['payload']) {
    const e = { type, payload };
    this._.events$.next(e as t.DbEvent);
  }
}
