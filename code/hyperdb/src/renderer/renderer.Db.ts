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
 * The [renderer] client to a `Db` that runs on the [main] prcoess.
 */
export class RendererDb<D extends object = any> implements t.IRendererDb<D> {
  /**
   * [Static]
   */
  public static async create<D extends object = any>(args: IConstructorArgs) {
    const db = new RendererDb<D>(args);
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
    this.dispose$.subscribe(() => (this._.isDisposed = true));

    // Promise that alerts when the Db is ready to interact with.
    const ready$ = new Subject();
    this.ready = ready$.toPromise();

    // Sync props.
    const state$ = this._.ipc.on<t.IDbUpdateStateEvent>('DB/state/update').pipe(
      takeUntil(this.dispose$),
      filter(e => e.payload.db.dir === this._.dir),
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

    // Ferry events through local observable.
    const events: Array<t.DbEvent['type']> = ['DB/watch', 'DB/error'];
    this._.ipc.events$
      .pipe(
        takeUntil(this.dispose$),
        filter(e => events.includes(e.type as any)),
        map(e => e as t.DbEvent),
        filter(e => e.payload.db.key === this.key),
      )
      .subscribe(e => this._.events$.next(e));
  }

  /**
   * [Fields]
   */
  public readonly ready: Promise<{}>;
  private readonly _ = {
    isDisposed: false,
    ipc: (null as unknown) as t.DbIpcRendererClient,
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

  public get isDisposed() {
    return this._.isDisposed || this.getProp('isDisposed');
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
  }

  public async version() {
    return this.invoke('version', []);
  }

  public async checkout(version: string) {
    const { ipc, dir } = this._;
    const dbKey = this.key;
    return RendererDb.create<D>({ ipc, dir, dbKey, version });
  }

  public async get<K extends keyof D>(key: K) {
    return this.invoke('get', [key]);
  }

  public async put<K extends keyof D>(key: K, value: D[K]) {
    return this.invoke('put', [key, value]);
  }

  public async del<K extends keyof D>(key: K) {
    return this.invoke('del', [key]);
  }

  public async watch(...pattern: string[]) {
    return this.invoke('watch', pattern);
  }

  public async unwatch(...pattern: string[]) {
    return this.invoke('unwatch', pattern);
  }

  public async connect() {
    const { dir, dbKey, version } = this._;
    const db = { dir, dbKey, version };
    this._.ipc.send<t.IDbConnectEvent>('DB/connect', { db }, TARGET_MAIN);
  }

  public async disconnect() {
    const { dir, dbKey, version } = this._;
    const db = { dir, dbKey, version };
    this._.ipc.send<t.IDbDisconnectEvent>('DB/disconnect', { db }, TARGET_MAIN);
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
    return this._.ipc.send<E>('DB/state/get', payload, TARGET_MAIN);
  }

  private async invoke<M extends keyof t.IDbMethods>(method: M, params: any[]) {
    type E = t.IDbInvokeEvent;
    type R = t.IDbInvokeResponse;
    const { dir, dbKey, version } = this._;
    const payload: E['payload'] = {
      db: { dir, dbKey, version },
      method,
      params,
    };
    const res = await this._.ipc.send<E, R>('DB/invoke', payload, TARGET_MAIN).promise;
    const data = res.dataFrom('MAIN');
    if (!data) {
      throw new Error(`Failed invoking '${method}'. No data was returned from MAIN.`);
    }
    if (data.error) {
      throw new Error(`Failed invoking '${method}'. ${data.error.message}`);
    }
    return data.result;
  }
}
