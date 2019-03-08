import { Subject } from 'rxjs';
import { filter, share, take, takeUntil } from 'rxjs/operators';

import * as t from './types';
const TARGET_MAIN = { target: 0 };

type IConstructorArgs = {
  db: t.IDbRenderer;
  ipc: t.IpcClient;
};

/**
 * The [renderer] client to a `Network` running ont [main] prcoess.
 */
export class NetworkRenderer implements t.INetworkRenderer {
  /**
   * [Static]
   */
  public static async create(args: IConstructorArgs) {
    const db = new NetworkRenderer(args);
    await db.ready;
    return db;
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
    const state$ = this._.ipc.on<t.INetworkUpdateStateEvent>('NETWORK/state/update').pipe(
      takeUntil(this.dispose$),
      filter(e => e.payload.db.dir === this._.db.dir),
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
  }

  /**
   * [Fields]
   */
  public readonly ready: Promise<{}>;
  private readonly _ = {
    db: (null as unknown) as t.IDbRenderer,
    ipc: (null as unknown) as t.NetworkIpcClient,
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
    const { dir } = this._.db;
    const payload: E['payload'] = { db: { dir } };
    return this._.ipc.send<E>('NETWORK/state/get', payload, TARGET_MAIN);
  }
}
