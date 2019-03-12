import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { is, value as valueUtil } from '../common';
import * as t from './types';
import * as util from './util';

if (is.browser) {
  throw new Error(`The Db should only be imported on the [main] process.`);
}

const hyperdb = require('hyperdb');
type WatcherRefs = { [key: string]: WatcherRef };
type WatcherRef = { destroy: () => void };

/**
 * Promise based wrapper around a HyperDB instance.
 *
 * See:
 *  - https://github.com/mafintosh/hyperdb#api
 *
 */
export class Db<D extends object = any> implements t.IDb<D> {
  /**
   * [Static]
   */
  public static create<D extends object = any>(args: {
    dir: string;
    dbKey?: string;
    version?: string;
  }) {
    return new Promise<Db<D>>(resolve => {
      const { dir, dbKey, version } = args;
      const reduce = (a: t.IDbNode, b: t.IDbNode) => a;
      const map = (node: t.IDbNode) => {
        // NB:  The underlying DB only stores [string/number/boolean]
        //      Ensure values are parsed into rich types (eg. objects and arrays etc) .
        node.value = util.parseValue(node.value);
        return node;
      };
      const options = { valueEncoding: 'utf-8', reduce, map };
      const db = args.dbKey ? hyperdb(dir, dbKey, options) : hyperdb(dir, options);
      db.on('ready', async () => {
        let result = new Db<D>({ db, dir });
        result = version ? await result.checkout(version) : result;
        resolve(result);
      });
    });
  }

  /**
   * [Constructor]
   */
  private constructor(args: { db: any; dir: string; version?: string }) {
    this._.db = args.db;
    this._.dir = args.dir;
    this._.version = args.version;
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    dir: '',
    db: null as any,
    version: undefined as string | undefined,
    dispose$: new Subject(),
    events$: new Subject<t.DbEvent>(),
    watchers: ({} as unknown) as WatcherRefs,
  };
  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );
  public readonly watch$ = this.events$.pipe(
    filter(e => e.type === 'DB/watch'),
    map(e => e.payload as t.IDbWatchChange),
    share(),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._.dispose$.isStopped;
  }

  public get dir() {
    return this._.dir;
  }

  public get key(): string {
    return this.buffer.key.toString('hex');
  }

  public get localKey(): string {
    return this.buffer.localKey.toString('hex');
  }

  public get discoveryKey(): string {
    return this.buffer.discoveryKey.toString('hex');
  }

  public get buffer() {
    const db = this._.db;
    const local = this._.db.local as t.IFeed;
    return {
      key: db.key as Buffer,
      localKey: local.key as Buffer,
      discoveryKey: db.discoveryKey as Buffer,
    };
  }

  public get watching() {
    return Object.keys(this._.watchers);
  }

  public get checkoutVersion() {
    return this._.version;
  }

  /**
   * [Methods]
   */

  /**
   * Disposes of the database.
   */
  public dispose() {
    this.unwatch();
    this._.events$.complete();
    this._.dispose$.next();
    this._.dispose$.complete();
  }

  /**
   * Starts a replication stream.
   */
  public replicate(options: { live?: boolean }) {
    this.throwIfDisposed('replicate');
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
    const userData = this.buffer.localKey;

    return this._.db.replicate({ live, userData }) as t.IProtocol;
  }

  /**
   * Checks whether a key is authorized to write to the database.
   */
  public isAuthorized(peerKey?: Buffer | string) {
    return new Promise<boolean>((resolve, reject) => {
      peerKey = !peerKey ? this.buffer.localKey : peerKey;
      peerKey = typeof peerKey === 'string' ? Buffer.from(peerKey, 'hex') : peerKey;
      this._.db.authorized(peerKey, (err: Error, result: boolean) => {
        return err ? this.fireError(err, reject) : resolve(result);
      });
    });
  }

  /**
   * Authorizes a peer to write to the database.
   */
  public async authorize(peerKey: Buffer | string) {
    this.throwIfDisposed('authorize');
    return new Promise<void>((resolve, reject) => {
      peerKey = typeof peerKey === 'string' ? Buffer.from(peerKey, 'hex') : peerKey;
      this._.db.authorize(peerKey, (err: Error) => {
        return err ? this.fireError(err, reject) : resolve();
      });
    });
  }

  /**
   * Get the current version identifier as a buffer for the db.
   */
  public version() {
    return new Promise<string>((resolve, reject) => {
      this._.db.version((err: Error, result: any) => {
        return err ? this.fireError(err, reject) : resolve(result.toString('hex'));
      });
    });
  }

  /**
   * Checkout the database at an older version.
   * The response is a new [Db] instance.
   *
   * NOTE:
   *      Version should be a version identifier returned
   *      by the `db.version` method.
   */
  public async checkout(version: string) {
    const db = this._.db.checkout(version);
    const dir = this.dir;
    return new Db<D>({ db, dir, version });
  }

  /**
   * Gets a value from the database.
   */
  public async get<K extends keyof D>(key: K) {
    this.throwIfDisposed('get');
    this.throwIfNoKey('get', key);
    return new Promise<t.IDbValue<K, D[K]>>((resolve, reject) => {
      this._.db.get(key, (err: Error, result: any) => {
        return err ? this.fireError(err, reject) : resolve(util.toValue(result));
      });
    });
  }

  /**
   * Writes a value to the database.
   */
  public async put<K extends keyof D>(key: K, value: D[K]) {
    this.throwIfDisposed('put');
    this.throwIfNoKey('put', key);
    return new Promise<t.IDbValue<K, D[K]>>((resolve, reject) => {
      const v = util.serializeValue(value);
      this._.db.put(key, v, (err: Error, result: any) => {
        return err ? this.fireError(err, reject) : resolve(util.toValue(result));
      });
    });
  }

  /**
   * Removes a value from the database.
   */
  public async delete<K extends keyof D>(key: K) {
    this.throwIfDisposed('delete');
    this.throwIfNoKey('delete', key);
    return new Promise<t.IDbValue<K, D[K]>>((resolve, reject) => {
      this._.db.del(key, (err: Error, result: any) => {
        return err ? this.fireError(err, reject) : resolve(util.toValue(result, { parse: true }));
      });
    });
  }

  /**
   * Retrieves the current values within the database.
   */
  public values<T extends object = D>(
    args: {
      pattern?: string; //            The value-key pattern to filter on.
      recursive?: boolean; // (true)  Return all subfolders. False only visits first node in each folder.
      gt?: boolean; //        (false) Return only nodes that are greater-than than the `pattern` prefix.
    } = {},
  ) {
    const prefix = args.pattern === '*' ? undefined : args.pattern;
    const recursive = valueUtil.defaultValue(args.recursive, true);
    const { gt = false } = args;
    return new Promise<t.IDbValues<T>>((resolve, reject) => {
      this._.db.list(prefix, { recursive, gt }, (err: Error, data: t.IDbNode[]) => {
        if (err) {
          return reject(err);
        }
        try {
          const v = data.reduce((acc, next) => ({ ...acc, [next.key]: util.toValue(next) }), {});
          resolve(v);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Starts a watcher for the given key/path.
   * Pass nothing to watch for all changes.
   *
   * NOTE:
   *    The use of `keyof T` allow for string typing of a DB data-set.
   *
   */
  public async watch<T extends object = D>(...pattern: Array<keyof T>) {
    this.throwIfDisposed('watch');
    const patterns = util.formatWatchPatterns(pattern);

    const storeRef = (key: string, watcher: WatcherRef) => {
      this.unwatch(key);
      this._.watchers[key] = watcher;
    };

    patterns.forEach(item => {
      const pattern = item.toString();
      if (this.watching.includes(pattern)) {
        return; // Already watching the given pattern.
      }

      const match = pattern === '*' ? '' : pattern; // NB: wildcard is matched as empty-string.

      const watcher = this._.db.watch(match, () => {
        watcher._nodes.forEach(async ({ key, value, deleted }: any) => {
          if (this.watching.includes('*') && pattern !== '*') {
            // When a wildcard is set, no need to fire for specific key patterns.
            // The wildcard will take care of them all.
            // This is to avoid duplicate events for a single change.
            return;
          }

          this.next<t.IDbWatchEvent>('DB/watch', {
            db: { key: this.key },
            pattern,
            key,
            value: util.parseValue(value),
            version: await this.version(),
            deleted,
          });
        });
      });

      storeRef(pattern, watcher);
    });
  }

  /**
   * Removes the watcher for the given key/path.
   * Pass nothing to turn-off all watchers.
   */
  public async unwatch<T extends object = D>(...pattern: Array<keyof T>) {
    const watchers = this._.watchers;
    pattern = Array.isArray(pattern) ? pattern : [pattern];
    const patterns =
      pattern.length === 0 ? Object.keys(this._.watchers) : util.formatWatchPatterns(pattern);
    patterns.forEach(key => {
      if (watchers[key]) {
        watchers[key].destroy();
        delete watchers[key];
      }
    });
  }

  public toString() {
    const { version } = this._;
    let res = `${this.dir}/key:${this.key}`;
    res = version ? `${res}/ver:${version}` : res;
    res = `[db:${res}]`;
    return res;
  }

  /**
   * [INTERNAL]
   */
  private fireError(error: Error, reject?: (reason: any) => void) {
    this.next<t.IDbErrorEvent>('DB/error', { db: { key: this.key }, error });
    if (reject) {
      reject(error);
    }
  }

  private next<E extends t.DbEvent>(type: E['type'], payload: E['payload']) {
    const e = { type, payload };
    this._.events$.next(e as t.DbEvent);
  }

  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      const msg = `Cannot '${action}' because the [HyperDb] client has been disposed.`;
      throw new Error(msg);
    }
  }

  private throwIfNoKey(action: string, key: any) {
    if (!key) {
      const msg = `Cannot '${action}' because a [key] was not specified.`;
      throw new Error(msg);
    }
  }
}
