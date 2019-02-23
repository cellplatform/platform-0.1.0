import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import * as t from './types';
import { Db } from '../db/Db';
import swarmDefaults from './Swarm.defaults';

const discovery = require('discovery-swarm');

type SwarmArgs = {
  db: Db;
  autoAuth?: boolean;
  join?: boolean;
};

/**
 * Represents a connection to a swarm of peers.
 *
 * See:
 *  - https://github.com/mafintosh/discovery-swarm
 *  - https://github.com/maxogden/discovery-channel
 *
 */
export class Swarm implements t.ISwarm {
  /**
   * [Static]
   */
  public static async create(args: SwarmArgs) {
    return new Swarm(args);
  }

  /**
   * [Constructor]
   */
  private constructor(args: SwarmArgs) {
    const { db, join = false, autoAuth = false } = args;
    this._.db = db;

    // Create and join the swarm.
    if (join) {
      this.join();
    }

    this.events$
      // Authorize connected peers that have the DB key.
      .pipe(
        filter(e => e.type === 'SWARM/peer/connected'),
        filter(() => autoAuth),
        map(e => e.payload as t.ISwarmPeerConnectedEvent['payload']),
        filter(e => Boolean(e.peer.remoteUserData)), // https://github.com/karissa/hyperdiscovery/pull/12#pullrequestreview-95597621
      )
      .subscribe(async e => {
        const peerKey = Buffer.from(e.peer.remoteUserData);
        const { isAuthorized } = await this.authorize(peerKey);
        if (isAuthorized) {
          const dbKey = this.dbKey;
          this.next<t.ISwarmPeerAuthorizedEvent>('SWARM/peer/authorized', {
            dbKey,
            isAuthorized,
            peerKey,
          });
        }
      });
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    db: (null as unknown) as Db,
    swarm: null as any,
    dispose$: new Subject(),
    events$: new Subject<t.SwarmEvent>(),
  };
  public isDisposed = false;
  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * [Properties]
   */
  public get dbKey() {
    return this._.db.key;
  }

  public get config() {
    const { db } = this._;
    return swarmDefaults({
      id: this.dbKey,
      stream: (peer: t.IPeer) => db.replicate({ live: true }),
    });
  }

  /**
   * Determines whether the swarm has been actively joined to the network.
   */
  public get isActive() {
    return Boolean(this._.swarm);
  }

  /**
   * [Methods]
   */

  /**
   * Disposes of the object and stops all related observables.
   */
  public dispose() {
    if (!this.isDisposed) {
      this.leave();
      this.isDisposed = true;
      this._.dispose$.next();
    }
  }

  /**
   * Connects to the swarm.
   */
  public join() {
    this.throwIfDisposed('join');
    return new Promise<void>(resolve => {
      // Create the discovery-swarm.
      const swarm = discovery(this.config);
      this._.swarm = swarm;
      const dbKey = this.dbKey;

      // Listen for connection events.
      swarm.on('connection', (peer: t.IProtocol) => {
        this.next<t.ISwarmPeerConnectedEvent>('SWARM/peer/connected', { dbKey, peer });
      });

      // Request to join.
      swarm.join(this.dbKey, undefined, () => {
        this.next<t.ISwarmJoinEvent>('SWARM/join', { dbKey });
        resolve();
      });
    });
  }

  /**
   * Leaves the swarm.
   */
  public async leave() {
    this.throwIfDisposed('leave');
    const swarm = this._.swarm;
    if (swarm) {
      const dbKey = this.dbKey;
      swarm.leave(this.dbKey);
      swarm.destroy();
      this._.swarm = undefined;
      this.next<t.ISwarmLeaveEvent>('SWARM/leave', { dbKey });
    }
  }

  /**
   * Attempts to authorize a peer.
   */
  public async authorize(peerKey: Buffer) {
    this.throwIfDisposed('authorize');
    const key = peerKey.toString('hex');
    try {
      const db = this._.db;
      const isAuthorized = await db.isAuthorized(peerKey);
      if (!isAuthorized) {
        await db.authorize(peerKey);
      }
      return { isAuthorized };
    } catch (err) {
      const error = new Error(`Failed to authorize peer '${key}'. ${err.message}`);
      this.fireError(error);
      return { isAuthorized: false, error };
    }
  }

  /**
   * Details about current connection state.
   */
  public async connections(): Promise<t.ISwarmConnections> {
    const { swarm, db } = this._;
    if (!swarm) {
      return { total: 0, peers: [] };
    }

    const toPeer = async (peer: t.IProtocol) => {
      const id = peer.id.toString('hex');
      const isAuthorized = await db.isAuthorized(peer.remoteUserData);
      const result: t.ISwarmConnectionPeer = { id, isAuthorized };
      return result;
    };

    type P = Promise<t.ISwarmConnectionPeer>;
    const wait: P[] = swarm.connections.map((p: t.IProtocol) => toPeer(p));
    const peers = (await Promise.all(wait)).filter(p => p.isAuthorized);

    return {
      total: peers.length,
      peers,
    };
  }

  /**
   * [INTERNAL]
   */
  private fireError(error: Error) {
    const dbKey = this.dbKey;
    this.next<t.ISwarmErrorEvent>('SWARM/error', { dbKey, error });
  }

  private next<E extends t.SwarmEvent>(type: E['type'], payload: E['payload']) {
    const e = { type, payload };
    this._.events$.next(e as t.SwarmEvent);
  }

  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      const msg = `Cannot '${action}' because the [Swarm] has been disposed.`;
      throw new Error(msg);
    }
  }
}
