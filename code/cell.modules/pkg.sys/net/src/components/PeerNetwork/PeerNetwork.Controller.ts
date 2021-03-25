import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import { PeerJS, rx, t, time } from '../../common';
import { PeerJSError } from './util.PeerJSError';

type NetworkRefs = { [id: string]: NetworkRef };
type NetworkRef = {
  peer: PeerJS;
  createdAt: number;
  signal: t.PeerNetworkSignalEndpoint;
  connections: ConnectionRef[];
};

type ConnectionRef = {
  kind: 'data' | 'media';
  id: t.PeerConnectionStatus['id'];
  conn: PeerJS.DataConnection | PeerJS.MediaConnection;
};

/**
 * EventBus contoller for a WebRTC [Peer] connection.
 */
export function PeerNetworkController(args: { bus: t.EventBus<any> }) {
  const dispose$ = new Subject<void>();
  const bus = args.bus.type<t.PeerNetworkEvent>();
  const $ = bus.event$.pipe(takeUntil(dispose$));

  const refs: NetworkRefs = {};

  /**
   * Add a new network-connection reference.
   */
  const addConnectionRef = (
    network: NetworkRef,
    kind: 'data' | 'media',
    conn: PeerJS.DataConnection | PeerJS.MediaConnection,
  ) => {
    const local = network.peer.id;
    const remote = conn.peer;
    const ref: ConnectionRef = { kind, id: { local, remote }, conn };
    network.connections = [...network.connections, ref];
    return ref;
  };

  /**
   * Convert a "local network client" to an immutable status object.
   */
  const toStatus = (local: NetworkRef): t.PeerNetworkStatus => {
    const { peer, createdAt, signal } = local;
    const id = peer.id;
    const connections = local.connections.map((item) => toConnectionStatus(item));
    return { id, createdAt, signal, connections };
  };

  /**
   * Convert a connection-reference to an immutable status object.
   */
  const toConnectionStatus = (connectionRef: ConnectionRef): t.PeerConnectionStatus => {
    const { kind, id } = connectionRef;

    if (kind === 'data') {
      const conn = connectionRef.conn as PeerJS.DataConnection;
      const { reliable: isReliable, open: isOpen } = conn;
      return { id, kind, isReliable, isOpen };
    }

    if (kind === 'media') {
      return { id, kind };
    }

    throw new Error(`Kind of connection not supported: '${kind}' (${id})`);
  };

  /**
   * Initialize a new PeerJS data-connection.
   */
  const initDataConnection = (
    direction: t.PeerNetworkConnected['direction'],
    local: NetworkRef,
    conn: PeerJS.DataConnection,
  ) => {
    const id = local.peer.id;
    const kind = 'data';
    const connectionRef = addConnectionRef(local, kind, conn);
    bus.fire({
      type: 'PeerNetwork/connected',
      payload: {
        id,
        kind,
        direction,
        target: connectionRef.id.remote,
        connection: toConnectionStatus(connectionRef),
      },
    });

    conn.on('close', () => {
      bus.fire({
        type: 'PeerNetwork/connection:closed',
        payload: { id, connection: toConnectionStatus(connectionRef) },
      });
    });
  };

  /**
   * CREATE a new network client.
   */
  rx.payload<t.PeerNetworkCreateEvent>($, 'PeerNetwork/create')
    .pipe()
    .subscribe((e) => {
      const id = (e.id || '').trim();

      if (!refs[id]) {
        const createdAt = time.now.timestamp;
        const endpoint = parseEndpointAddress(e.signal);
        const { host, path, port, secure } = endpoint;
        const peer = new PeerJS(id, { host, path, port, secure });
        const ref: NetworkRef = { peer, createdAt, signal: endpoint, connections: [] };
        refs[id] = ref;

        /**
         * Listen for incoming DATA connection requests.
         */
        peer.on('connection', (conn) => initDataConnection('incoming', ref, conn));
      }

      const ref = refs[id];
      bus.fire({
        type: 'PeerNetwork/created',
        payload: { id, createdAt: ref.createdAt, signal: ref.signal },
      });
    });

  /**
   * STATUS
   */
  rx.payload<t.PeerNetworkStatusRequestEvent>($, 'PeerNetwork/status:req')
    .pipe()
    .subscribe((e) => {
      const { id } = e;
      const ref = refs[id];
      const network = ref ? toStatus(ref) : undefined;
      bus.fire({
        type: 'PeerNetwork/status:res',
        payload: { id, exists: Boolean(network), network },
      });
    });

  /**
   * CONNECT to a remote peer.
   */
  rx.payload<t.PeerNetworkConnectEvent>($, 'PeerNetwork/connect')
    .pipe()
    .subscribe((e) => {
      const { id, target, kind } = e;
      const ref = refs[id];

      const fire = (payload: Partial<t.PeerNetworkConnected>) => {
        bus.fire({
          type: 'PeerNetwork/connected',
          payload: { kind, id, target, direction: 'outgoing', ...payload },
        });
      };

      const fireError = (message: string) => fire({ error: { message } });

      if (!ref) {
        const message = `The local PeerNetwork '${id}' has not been created`;
        return fireError(message);
      }

      if (e.kind === 'data') {
        const { reliable } = e;
        const conn = ref.peer.connect(target, { reliable });
        const errorMonitor = PeerJSError(ref.peer);

        conn.on('open', () => {
          // Success.
          // Connected to the remote peer.
          errorMonitor.dispose();
          initDataConnection('outgoing', ref, conn);
        });

        // Listen for a connection error.
        // Will happen on:
        //  - timeout (peer id not found on network).
        errorMonitor.$.pipe(
          filter((err) => err.type === 'peer-unavailable'),
          filter((err) => err.message.includes(`peer ${target}`)),
          take(1),
        ).subscribe((err) => {
          errorMonitor.dispose();
          fireError(`Failed to connect to peer '${target}'. Target did not respond.`);
        });
      }

      if (e.kind === 'media') {
        /**
         * TODO 🐷
         */
        throw new Error('Not implemented');
      }
    });

  return {
    dispose$,
    dispose() {
      dispose$.next();
      Object.keys(refs).forEach((key) => refs[key]);
    },
  };
}

/**
 * Helpers
 */

const parseEndpointAddress = (address: string): t.PeerNetworkSignalEndpoint => {
  address = stripHttp((address || '').trim());

  const parts = address.trim().split('/');
  const path = stripPathLeft(parts[1]) || undefined;

  const hostParts = (parts[0] || '').split(':');

  const host = hostParts[0];
  const secure = !host.startsWith('localhost');
  const port = hostParts[1] ? parseInt(hostParts[1], 10) : secure ? 443 : 80;

  return { host, port, path, secure };
};

const stripHttp = (text?: string) =>
  (text || '')
    .trim()
    .replace(/^http\:\/\//, '')
    .replace(/^https\:\/\//, '');

const stripPathLeft = (text?: string) => (text || '').trim().replace(/^\/*/, '').trim();
