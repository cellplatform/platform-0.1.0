import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { HyperDb } from '../db/main';
import * as t from '../types';
import swarmDefaults from './main.defaults';

const discovery = require('discovery-swarm');

/**
 * Represents a connection to a swarm of peers.
 *
 * See:
 *  - https://github.com/mafintosh/discovery-swarm
 *  - https://github.com/maxogden/discovery-channel
 *
 */
export class Swarm {
  public readonly id: string;

  private readonly _ = {
    isDisposed: false,
    db: (null as unknown) as HyperDb,
    swarm: null as any,
    dispose$: new Subject(),
    events$: new Subject<t.SwarmEvent>(),
  };

  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  constructor(args: { id: string; db: HyperDb; autoAuth?: boolean; join?: boolean }) {
    const { id, db, join = false, autoAuth = false } = args;
    this.id = id;
    this._.db = db;

    // Create the swarm and listen for connection events.
    const defaults = swarmDefaults({
      id,
      stream: peer => db.replicate({ live: true }),
    });
    const swarm = discovery(defaults);
    this._.swarm = swarm;

    if (join) {
      this.join();
    }

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

    // Store state.
    this.dispose$.subscribe(() => (this._.isDisposed = true));
  }

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
      this._.swarm.join(this.id, {}, () => resolve());
    });
  }

  /**
   * Attempts to authorize a peer.
   */
  public async authorize(peerKey: Buffer) {
    try {
      const db = this._.db;
      const isAuthorized = await db.isAuthorized(peerKey);
      if (!isAuthorized) {
        await db.isAuthorized(peerKey);
      }
      return { isAuthorized };
    } catch (err) {
      const key = peerKey.toString('hex');
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
