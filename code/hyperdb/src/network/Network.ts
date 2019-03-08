import * as crypto from 'crypto';
import { Socket } from 'net';
import { Subject } from 'rxjs';
import { share, takeUntil, filter, take } from 'rxjs/operators';

import { Db } from '../db';
import * as t from '../types';

const network = require('@hyperswarm/network');
const pump = require('pump');

export * from './types';

type INetworkArgs = { db: Db };

/**
 * Manages the network swarm for a single hyperdb.
 */
export class Network {
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
    const net = (this._.net = network());
    this._.id = crypto
      .createHash('sha256')
      .update($key)
      .digest();

    net.on('connection', this.onConnection);
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    db: (undefined as unknown) as Db,
    net: undefined as any,
    id: (undefined as unknown) as Buffer,
    dispose$: new Subject(),
    events$: new Subject<t.NetworkEvent>(),
    status: 'DISCONNECTED' as t.NetworkStatus,
    connecting: undefined as Promise<{}> | undefined,
    connection: undefined as t.INetworkConnectionInfo | undefined,
    replication: undefined as t.IProtocol | undefined,
  };
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

  public get id() {
    return this._.id.toString('hex');
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

  public isHolePunchable() {
    this.throwIfDisposed('isHolePunchable');
    return new Promise<boolean>(resolve => {
      this._.net.discovery.holepunchable((err: Error, yes: boolean) => {
        resolve(yes && !err);
      });
    });
  }

  /**
   * Connects to the swarm.
   */
  public connect() {
    this.throwIfDisposed('connect');
    const { id, net } = this._;

    if (this._.connecting) {
      return this._.connecting; // Return the connection promise if already connected.
    }

    this._.connecting = new Promise(async (resolve, reject) => {
      try {
        const isHolePunchable = await this.isHolePunchable();
        if (!isHolePunchable) {
          const err = 'Network cannot be hole-punched.';
          reject(new Error(err));
        }

        this.changeStatus('CONNECTING');
        net.join(id, { lookup: true, announce: true });
        this.events$
          .pipe(
            filter(e => e.type === 'NETWORK/connection' && e.payload.isConnected),
            take(1),
          )
          .subscribe(() => resolve());
      } catch (error) {
        reject(error);
      }
    });

    // Finish up.
    return this._.connecting;
  }

  /**
   * Disconnects from the swarm.
   */
  public disconnect() {
    this.throwIfDisposed('disconnect');
    this._.connecting = undefined;
    this._.connection = undefined;
    this._.net.leave(this._.id);
    if (this._.replication) {
      this._.replication.destroy();
    }
    this.changeStatus('DISCONNECTED');
  }

  /**
   * [INTERNAL]
   */
  private onConnection = (socket: Socket, info: any) => {
    const { db } = this._;

    // Convert info into storage object.
    const peer = info.peer ? { ...info.peer, topic: info.peer.topic.toString('hex') } : undefined;
    if (peer) {
      peer.referrer = peer.referrer
        ? { ...peer.referrer, id: peer.referrer.id.toString('hex') }
        : undefined;
    }
    const connection: t.INetworkConnectionInfo = { ...info, peer };
    this._.connection = connection;

    // Update state.
    this.changeStatus('CONNECTED');

    // Replicate the DB.
    const rep = (this._.replication = db.replicate({ live: true }));
    pump(rep, socket, rep, () => {
      // Socket Pipe Ended.
    });

    socket.on('data', (data: any) => {
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
