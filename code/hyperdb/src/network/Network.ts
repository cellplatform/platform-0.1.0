import * as crypto from 'crypto';
import { Socket } from 'net';
import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import { time } from '../common';
import { Db } from '../db';
import * as t from '../types';

const hyperswarm = require('@hyperswarm/network');
const pump = require('pump');

export * from './types';

type INetworkArgs = { db: Db };
type SocketRefs = {
  replication: t.IProtocol;
  connection: Socket;
};

/**
 * Manages the network swarm for a single hyperdb.
 */
export class Network implements t.INetwork {
  /**
   * [Static]
   */
  public static create(args: INetworkArgs) {
    const network = new Network(args);
    return network;
  }

  /**
   * [Constructor]
   */
  private constructor(args: INetworkArgs) {
    const db = (this._.db = args.db);
    const $key = db.key;

    this._.topic = crypto
      .createHash('sha256')
      .update($key)
      .digest();

    // Promise that alerts when the Db is ready to interact with.
    const ready$ = new Subject();
    this.ready = ready$.toPromise();

    // Finish up.
    ready$.next(); // NB: Fires immediately, this is here for symmetry with the client.
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    ready: new Subject(),
    db: (undefined as unknown) as Db,
    network: undefined as any,
    topic: (undefined as unknown) as Buffer,
    dispose$: new Subject(),
    events$: new Subject<t.NetworkEvent>(),
    status: 'DISCONNECTED' as t.NetworkStatus,
    connection: undefined as t.INetworkConnectionInfo | undefined,
    sockets: undefined as SocketRefs | undefined,
    isHolePunchable: undefined as boolean | undefined,
  };
  public readonly ready: Promise<{}>;
  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._.dispose$.isStopped;
  }

  public get topic() {
    return this._.topic.toString('hex');
  }

  public get status() {
    return this._.status;
  }

  public get isConnected() {
    return this._.status === 'CONNECTED';
  }

  public get connection() {
    return this._.connection;
  }

  public get db() {
    const { key, localKey } = this._.db;
    return { key, localKey };
  }

  /**
   * [Methods]
   */
  public dispose() {
    if (!this.isDisposed) {
      this.disconnect();
      this._.events$.complete();
      this._.dispose$.next();
      this._.dispose$.complete();
    }
  }

  private isHolePunchable(network: any) {
    this.throwIfDisposed('isHolePunchable');
    return new Promise<boolean>(resolve => {
      if (this._.isHolePunchable !== undefined) {
        return resolve(this._.isHolePunchable);
      }
      network.discovery.holepunchable((err: Error, yes: boolean) => {
        this._.isHolePunchable = yes && !err;
        resolve(this._.isHolePunchable);
      });
    });
  }

  /**
   * Connects to the swarm.
   */
  public async connect() {
    this.throwIfDisposed('connect');
    if (this._.network) {
      return; // Already connected.
    }

    // Create the network swarm.
    const network = (this._.network = hyperswarm());
    network.on('connection', this.onConnection);

    // Determine if the network can be hole-punched.
    const isHolePunchable = await this.isHolePunchable(network);
    if (!isHolePunchable) {
      const err = 'Network cannot be hole-punched.';
      throw new Error(err);
    }

    // Start the connection process.
    network.join(this._.topic, { lookup: true, announce: true });
    this.changeStatus('CONNECTING');
  }

  /**
   * Disconnects from the swarm.
   */
  public async disconnect() {
    this.throwIfDisposed('disconnect');
    this._.connection = undefined;
    if (this._.network) {
      this._.network.removeListener('connection', this.onConnection);
      this._.network.leave(this._.topic);
      this._.network = undefined;
    }
    if (this._.sockets) {
      this._.sockets.connection.destroy();
      this._.sockets.replication.destroy();
      this._.sockets = undefined;
    }
    this.changeStatus('DISCONNECTED');
  }

  /**
   * Reconnects to the network.
   */
  public async reconnect() {
    await this.disconnect();
    await this.connect();
  }

  /**
   * Display string.
   */
  public toString() {
    return `[network:${this.topic}]`;
  }

  /**
   * [INTERNAL]
   */
  private onConnection = (socket: Socket, details: any) => {
    const { db } = this._;

    // Convert info into storage object.
    const peer = details.peer
      ? { ...details.peer, topic: details.peer.topic.toString('hex') }
      : undefined;
    if (peer) {
      peer.referrer = peer.referrer
        ? { ...peer.referrer, id: peer.referrer.id.toString('hex') }
        : undefined;
    }
    const info: t.INetworkConnectionInfo = { ...details, peer };
    this._.connection = info;

    // Update state.
    this.changeStatus('CONNECTED');

    /**
     * TODO
     * - store connection in a way that `conn` can be disposed of upon leave.
     * - monitor heartbeat, restart connection on failure.
     */

    // Replicate the DB.
    const replication = db.replicate({ live: true });
    pump(replication, socket, replication, () => {
      /* Socket Pipe Ended. */
    });

    this._.sockets = { replication, connection: socket };

    // const TMP_COUNT = 0;
    let TEMP_TIMER = time.timer();
    let times: number[] = [];
    socket.on('data', (data: Buffer) => {
      const elapsed = TEMP_TIMER.elapsed();
      times = [...times, elapsed];
      const avg = times.reduce((acc, next) => acc + next, 0) / times.length;

      // console.log('data', `(${TMP_COUNT++}) elapsed: ${elapsed} | avg: ${avg}`);

      TEMP_TIMER = time.timer();

      const db = this.db;
      this._.events$.next({ type: 'NETWORK/data', payload: { db } });
    });
  };

  private changeStatus(status: t.NetworkStatus) {
    if (status !== this.status) {
      this._.status = status;
      const isConnected = this.isConnected;
      const connection = this.connection;
      const db = this.db;
      this._.events$.next({
        type: 'NETWORK/connection',
        payload: { status, isConnected, db, connection },
      });
    }
  }

  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      const msg = `Cannot '${action}' because the [Swarm] has been disposed.`;
      throw new Error(msg);
    }
  }
}
