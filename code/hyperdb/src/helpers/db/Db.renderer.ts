import { IpcClient } from '@platform/electron/lib/types';
import { Subject } from 'rxjs';
import { share, take, takeUntil, filter, map } from 'rxjs/operators';

import * as t from './types';

type IConstructorArgs = {
  ipc: IpcClient;
  storage: string;
  dbKey?: string;
  props?: t.IDbProps;
};

const TARGET_MAIN = { target: 0 };

/**
 * The [renderer] client to a `Db` that runs on the [main] prcoess.
 */
export class Db<D extends object = any> implements t.IDb<D> {
  /**
   * [Static]
   */
  public static async create<D extends object = any>(args: IConstructorArgs) {
    const db = new Db<D>(args);
    await db.ready;
    return db;
  }

  /**
   * [Constructor]
   */
  private constructor(args: IConstructorArgs) {
    this._ipc = args.ipc;
    this._storage = args.storage;
    this._dbKey = args.dbKey;
    this.dispose$.subscribe(() => (this._.isDisposed = true));

    // Promise that alerts when the Db is ready to interact with.
    const ready$ = new Subject();
    this.ready = ready$.toPromise();

    // Sync props.
    const state$ = this._ipc.on<t.IDbIpcUpdateStateEvent>('HYPERDB/state/update').pipe(
      takeUntil(this.dispose$),
      filter(e => e.payload.db.storage === this._storage),
    );
    state$.subscribe(e => {
      const { props } = e.payload;

      // Sync props with provided values.
      // Object.keys(props).forEach(key => {
      //   this._.props[key] = props[key].value;
      // });
      this._.props = props;

      // Dispose of the local client if it's been disposed remotely.
      // const isDisposed = props.isDisposed && props.isDisposed.value === true;
      if (props.isDisposed) {
        this.dispose();
      }
    });
    state$.pipe(take(1)).subscribe(() => ready$.complete());
    this.syncState();

    // TEMP 🐷

    // this.invoke('version');
    // this.invoke('put', ['foo', 123]);
    // this.invoke('get', ['foo']);
  }

  /**
   * [Fields]
   */
  public readonly ready: Promise<{}>;
  private readonly _ipc: t.DbIpcClient;
  private readonly _storage: string;
  private readonly _dbKey: string | undefined;

  private readonly _ = {
    isDisposed: false,
    dispose$: new Subject(),
    events$: new Subject<t.DbEvent>(),
    props: (null as unknown) as t.IDbProps,
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

  /**
   * [Methods]
   */
  public dispose() {
    this._.dispose$.next();
  }

  public async version() {
    return this.invoke('version');
  }

  public async checkout(version: string) {
    console.log(`\nTODO 🐷   \n`);
    /**
     * TODO
     * - checkout
     * - dispose (fire dispose event back to MAIN and remove from refs)
     */
    return this;
  }

  public async get<K extends keyof D>(key: K) {
    return this.invoke('get', key);
  }

  public async put<K extends keyof D>(key: K, value: D[K]) {
    return this.invoke('put', value);
  }

  public async del<K extends keyof D>(key: K) {
    return this.invoke('del', key);
  }

  public async watch(...pattern: string[]) {
    return this.invoke('watch', ...pattern);
  }

  public async unwatch(...pattern: string[]) {
    return this.invoke('unwatch', ...pattern);
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
    type E = t.IDbIpcGetStateEvent;
    const payload: E['payload'] = {
      db: { storage: this._storage, dbKey: this._dbKey },
    };
    return this._ipc.send<E>('HYPERDB/state/get', payload, TARGET_MAIN);
  }

  private async invoke<M extends keyof t.IDbMethods>(method: M, ...params: any[]) {
    type E = t.IDbIpcInvokeEvent;
    type R = t.IDbIpcInvokeResponse;
    const payload: E['payload'] = {
      db: { storage: this._storage, dbKey: this._dbKey },
      method,
      params,
    };
    const res = await this._ipc.send<E, R>('HYPERDB/invoke', payload, TARGET_MAIN).promise;
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
