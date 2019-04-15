import { IpcClient } from '@platform/electron/lib/types';
import { Subject } from 'rxjs';
import { share, take, takeUntil, filter, map } from 'rxjs/operators';

import * as t from './types';

type IConstructorArgs = {
  ipc: IpcClient;
  dir: string;
  dbKey?: string;
  version?: string; // Version of DB to checkout at.
};

const TARGET_MAIN = { target: 0 };

/**
 * The [renderer] client to a `Db` running on the [main] prcoess.
 */
export class DbRenderer<D extends object = any> implements t.IDbRenderer<D> {
  /**
   * [Static]
   */
  public static async create<D extends object = any>(args: IConstructorArgs) {
    const db = new DbRenderer<D>(args);
    await db.ready;
    return db;
  }

  /**
   * [Constructor]
   */
  private constructor(args: IConstructorArgs) {
    this._.ipc = args.ipc;
    this._.dir = args.dir;
    this._.dbKey = args.dbKey;
    this._.version = args.version;

    // Promise that alerts when the Db is ready to interact with.
    const ready$ = new Subject();
    this.ready = ready$.toPromise();

    // Sync props.
    const state$ = this._.ipc.on<t.IDbUpdateStateEvent>('DB/ipc/state/update').pipe(
      takeUntil(this.dispose$),
      filter(e => e.payload.db.dir === this._.dir && e.payload.db.version === this._.version),
    );
    state$.subscribe(e => {
      const { props } = e.payload;
      this._.props = props;
      if (props.isDisposed) {
        this.dispose();
      }
    });
    state$.pipe(take(1)).subscribe(() => ready$.complete());
    this.syncState();

    // Ferry DB events through the local observable
    // (but not the internal renderer/IPC system events).
    this._.ipc.events$
      .pipe(
        takeUntil(this.dispose$),
        filter(e => e.type.startsWith('DB/')),
        filter(e => !e.type.startsWith('DB/ipc/')),
        map(e => e as t.DbEvent),
      )
      .subscribe(e => this._.events$.next(e));
  }

  /**
   * [Fields]
   */
  public readonly ready: Promise<{}>;
  private readonly _ = {
    ipc: (null as unknown) as t.HyperdbIpc,
    dispose$: new Subject(),
    events$: new Subject<t.DbEvent>(),
    props: (null as unknown) as t.IDbProps,
    dir: '',
    dbKey: (undefined as unknown) as string | undefined,
    version: (undefined as unknown) as string | undefined,
  };
  public readonly dispose$ = this._.dispose$.pipe(
    take(1),
    share(),
  );
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
    return this._.dispose$.isStopped || this.getProp('isDisposed');
  }

  public get dir() {
    return this.getProp('dir');
  }

  public get key() {
    return this.getProp('key');
  }

  public get discoveryKey() {
    return this.getProp('discoveryKey');
  }

  public get localKey() {
    return this.getProp('localKey');
  }

  public get watching() {
    return this.getProp('watching');
  }

  public get checkoutVersion() {
    return this._.version;
  }

  /**
   * [Methods]
   */
  public dispose() {
    this._.events$.complete();
    this._.dispose$.next();
    this._.dispose$.complete();
  }

  public async version() {
    return this.invoke('version', []);
  }

  public async checkout(version: string) {
    const { ipc, dir } = this._;
    const dbKey = this.key;
    return DbRenderer.create<D>({ ipc, dir, dbKey, version });
  }

  public async get<K extends keyof D>(key: K) {
    return this.invoke('get', [key]) as Promise<t.IDbValue<K, D[K]>>;
  }

  public async put<K extends keyof D>(key: K, value: D[K]) {
    return this.invoke('put', [key, value]) as Promise<t.IDbValue<K, D[K]>>;
  }

  public async delete<K extends keyof D>(key: K) {
    return this.invoke('delete', [key]) as Promise<t.IDbValue<K, D[K]>>;
  }

  public async values<T extends object = D>(args: t.IDbValuesArgs) {
    return this.invoke('values', [args]) as Promise<t.IDbValues<T>>;
  }

  public async updateMany<T extends object = D>(args: t.IDbUpdateObject<T> | t.IDbUpdateList<T>) {
    return this.invoke('updateMany', [args]) as Promise<t.IDbValues<T>>;
  }

  public async watch<T extends object = D>(...pattern: Array<keyof T>) {
    return this.invoke('watch', pattern) as Promise<void>;
  }

  public async unwatch<T extends object = D>(...pattern: Array<keyof T>) {
    return this.invoke('unwatch', pattern) as Promise<void>;
  }

  public async authorize(peerKey: string) {
    return this.invoke('authorize', [peerKey]) as Promise<void>;
  }

  public async isAuthorized(peerKey?: string) {
    return this.invoke('isAuthorized', [peerKey]) as Promise<boolean>;
  }

  public async history<K extends keyof D>(key: K, options: { take?: number } = {}) {
    return this.invoke('history', [key, options]) as Promise<Array<t.IDbValue<K, D[K]>>>;
  }

  public toString() {
    const { dir, version } = this._;
    let res = `${dir}/key:${this.key}`;
    res = version ? `${res}/ver:${version}` : res;
    res = `[db:${res}]`;
    return res;
  }

  /**
   * [Internal]
   */
  private getProp<K extends keyof t.IDbProps>(key: K): t.IDbProps[K] {
    if (!this._.props) {
      throw new Error(`The DB property '${key}' has not been synced yet.`);
    }
    return this._.props[key];
  }

  private async syncState() {
    type E = t.IDbGetStateEvent;
    const { dir, dbKey, version } = this._;
    const payload: E['payload'] = {
      db: { dir, dbKey, version },
    };
    return this._.ipc.send<E>('DB/ipc/state/get', payload, TARGET_MAIN);
  }

  private async invoke<M extends keyof t.IDbMethods>(method: M, params: any[], wait?: boolean) {
    type E = t.IDbInvokeEvent;
    type R = t.IDbInvokeResponse;
    const { dir, dbKey } = this._;
    const version = this.checkoutVersion;
    const payload: E['payload'] = {
      db: { dir, dbKey, version },
      method,
      params,
      wait,
    };
    const res = await this._.ipc.send<E, R>('DB/ipc/invoke', payload, {
      ...TARGET_MAIN,
      timeout: 20000,
    }).promise;
    const data = res.dataFrom('MAIN');
    const prefix = `Failed invoking DB method '${method}'`;
    if (!data) {
      throw new Error(`${prefix}. No data was returned from MAIN.`);
    }
    if (data.error) {
      throw new Error(`${prefix}. ${data.error.message}`);
    }
    return data.result;
  }
}
