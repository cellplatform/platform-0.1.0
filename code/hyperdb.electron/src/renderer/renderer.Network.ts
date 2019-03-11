import { Subject } from 'rxjs';
import { filter, share, take, takeUntil, map, debounceTime } from 'rxjs/operators';

import * as t from './types';
const TARGET_MAIN = { target: 0 };

type IConstructorArgs = {
  db: t.IDbRenderer;
  ipc: t.IpcClient;
  connect?: boolean;
};

/**
 * The [renderer] client to a `Network` running ont [main] prcoess.
 */
export class NetworkRenderer implements t.INetworkRenderer {
  /**
   * [Static]
   */
  public static async create(args: IConstructorArgs) {
    const network = new NetworkRenderer(args);
    await network.ready;
    if (args.connect) {
      network.connect();
    }
    return network;
  }

  /**
   * [Constructor]
   */
  private constructor(args: IConstructorArgs) {
    this._.ipc = args.ipc;
    this._.db = args.db;

    // Promise that alerts when the Db is ready to interact with.
    const ready$ = new Subject();
    this.ready = ready$.toPromise();

    // Sync props.
    const state$ = this._.ipc.on<t.INetworkUpdateStateEvent>('NETWORK/ipc/state/update').pipe(
      takeUntil(this.dispose$),
      filter(
        e =>
          e.payload.db.dir === this._.db.dir && e.payload.db.version === this._.db.checkoutVersion,
      ),
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

    // Ferry network events through the local observable
    // (but not the internal renderer/IPC system events).
    this._.ipc.events$
      .pipe(
        takeUntil(this.dispose$),
        filter(e => e.type.startsWith('NETWORK/')),
        filter(e => !e.type.startsWith('NETWORK/ipc/')),
        map(e => e as t.NetworkEvent),
      )
      .subscribe(e => this._.events$.next(e));

    // Update state on network events.
    this.events$
      .pipe(
        filter(e => e.type !== 'NETWORK/data'), // NB: Data is noise and does not require a state update.
        debounceTime(10),
      )
      .subscribe(e => this.syncState());
  }

  /**
   * [Fields]
   */
  public readonly ready: Promise<{}>;
  private readonly _ = {
    db: (null as unknown) as t.IDbRenderer,
    ipc: (null as unknown) as t.HyperdbIpc,
    dispose$: new Subject(),
    events$: new Subject<t.NetworkEvent>(),
    props: (null as unknown) as t.INetworkProps,
  };
  public readonly dispose$ = this._.dispose$.pipe(
    take(1),
    share(),
  );
  public readonly events$ = this._.events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._.dispose$.isStopped || this.getProp('isDisposed');
  }

  public get topic() {
    return this.getProp('topic');
  }
  public get status() {
    return this.getProp('status');
  }
  public get isConnected() {
    return this.getProp('isConnected');
  }
  public get connection() {
    return this.getProp('connection');
  }
  public get db() {
    return this.getProp('db');
  }

  /**
   * [Methods]
   */
  public dispose() {
    this._.events$.complete();
    this._.dispose$.next();
    this._.dispose$.complete();
  }

  public async connect() {
    this.invoke('connect', [], false);
  }
  public async disconnect() {
    this.invoke('disconnect', [], false);
  }

  public toString() {
    return `[network:${this.topic}]`;
  }

  /**
   * [Internal]
   */
  private getProp<K extends keyof t.INetworkProps>(key: K): t.INetworkProps[K] {
    if (!this._.props) {
      throw new Error(`The Network property '${key}' has not been synced yet.`);
    }
    return this._.props[key];
  }

  private async syncState() {
    type E = t.INetworkGetStateEvent;
    const { dir, checkoutVersion: version } = this._.db;
    const payload: E['payload'] = { db: { dir, version } };
    return this._.ipc.send<E>('NETWORK/ipc/state/get', payload, TARGET_MAIN);
  }

  private async invoke<M extends keyof t.INetworkMethods>(
    method: M,
    params: any[],
    wait?: boolean,
  ) {
    type E = t.INetworkInvokeEvent;
    type R = t.INetworkInvokeResponse;
    const db = this._.db;
    const dir = db.dir;
    const version = db.checkoutVersion;
    const payload: E['payload'] = {
      db: { dir, version },
      method,
      params,
      wait,
    };
    const res = await this._.ipc.send<E, R>('NETWORK/ipc/invoke', payload, TARGET_MAIN).promise;
    const data = res.dataFrom('MAIN');
    const prefix = `Failed invoking Network method '${method}'`;
    if (!data) {
      throw new Error(`${prefix}. No data was returned from MAIN.`);
    }
    if (data.error) {
      throw new Error(`${prefix}. ${data.error.message}`);
    }
    return data.result;
  }
}
