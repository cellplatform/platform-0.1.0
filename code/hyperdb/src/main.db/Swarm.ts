import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import * as t from '../types';
import { Db } from './Db';
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
export class Swarm {
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
    const id = db.key.toString('hex');
    this.id = id;
    this._.db = db;
    this.dispose$.subscribe(() => (this._.isDisposed = true));

    // Create the swarm.
    const swarm = (this._.swarm = discovery(this.config));
    if (join) {
      this.join();
    }

    // Listen for connection events.
    this.events$
      .pipe(
        filter(e => e.type === 'SWARM/connection'),
        filter(() => autoAuth),
        map(e => e.payload as t.ISwarmConnectionEvent['payload']),
        filter(e => Boolean(e.peer.remoteUserData)), // https://github.com/karissa/hyperdiscovery/pull/12#pullrequestreview-95597621
      )
      .subscribe(async e => {
        const peerKey = Buffer.from(e.peer.remoteUserData);
        const { isAuthorized } = await this.authorize(peerKey);
        if (isAuthorized) {
          this.next<t.ISwarmPeerConnectedEvent>('SWARM/peerConnected', { isAuthorized, peerKey });
        }
      });

    swarm.on('connection', (peer: t.IProtocol) => {
      this.next<t.ISwarmConnectionEvent>('SWARM/connection', { peer });
    });
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    db: (null as unknown) as Db,
    swarm: null as any,
    isDisposed: false,
    dispose$: new Subject(),
    events$: new Subject<t.SwarmEvent>(),
  };
  public readonly id: string;
  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * [Properties]
   */
  public get config() {
    const { db } = this._;
    return swarmDefaults({
      id: this.id,
      stream: (peer: t.IPeer) => db.replicate({ live: true }),
    });
  }

  /**
   * [Methods]
   */

  /**
   * Disposes of the object and stops all related observables.
   */
  public dispose() {
    this._.dispose$.next();
  }
  public get isDisposed() {
    return this._.isDisposed;
  }

  /**
   * Connects to the swarm.
   */
  public join() {
    return new Promise(resolve => {
      this._.swarm.join(this.id, undefined, () => resolve());
    });
  }

  /**
   * Attempts to authorize a peer.
   */
  public async authorize(peerKey: Buffer) {
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
   * [INTERNAL]
   */
  private fireError(error: Error) {
    this.next<t.ISwarmErrorEvent>('SWARM/error', { error });
  }

  private next<E extends t.SwarmEvent>(type: E['type'], payload: E['payload']) {
    const e = { type, payload };
    this._.events$.next(e as t.SwarmEvent);
  }
}
