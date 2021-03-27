import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import { PeerJS, rx, t, time } from '../../common';
import { PeerJSError } from './util';

type NetworkRefs = { [id: string]: NetworkRef };
type NetworkRef = {
  id: string;
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
  const toStatus = (ref: NetworkRef): t.PeerNetworkStatus => {
    const { peer, createdAt, signal } = ref;
    const id = peer.id;
    const connections = ref.connections.map((item) => toConnectionStatus(item));
    return { id, createdAt, signal, connections };
  };

  /**
   * Convert a connection-reference to an immutable status object.
   */
  const toConnectionStatus = (ref: ConnectionRef): t.PeerConnectionStatus => {
    const { kind, id } = ref;

    if (kind === 'data') {
      const conn = ref.conn as PeerJS.DataConnection;
      const { reliable: isReliable, open: isOpen, metadata } = conn;
      return { id, kind, isReliable, isOpen, metadata };
    }

    if (kind === 'media') {
      const conn = ref.conn as PeerJS.MediaConnection;
      const { open: isOpen, metadata } = conn;
      return { id, kind, isOpen, metadata };
    }

    throw new Error(`Kind of connection not supported: '${kind}' (${id})`);
  };

  /**
   * Initialize a new PeerJS data-connection.
   */
  const initDataConnection = (
    direction: t.PeerNetworkConnectRes['direction'],
    network: NetworkRef,
    conn: PeerJS.DataConnection,
  ) => {
    const kind = 'data';
    const connectionRef = addConnectionRef(network, kind, conn);
    bus.fire({
      type: 'PeerNetwork/connect:res',
      payload: {
        ref: network.id,
        kind,
        direction,
        remote: connectionRef.id.remote,
        connection: toConnectionStatus(connectionRef),
      },
    });

    conn.on('close', () => {
      bus.fire({
        type: 'PeerNetwork/connection:closed',
        payload: {
          ref: network.id,
          connection: toConnectionStatus(connectionRef),
        },
      });
    });
  };

  /**
   * CREATE a new network client.
   */
  rx.payload<t.PeerNetworkCreateReqEvent>($, 'PeerNetwork/create:req')
    .pipe()
    .subscribe((e) => {
      const local = (e.ref || '').trim();

      if (!refs[local]) {
        const createdAt = time.now.timestamp;
        const endpoint = parseEndpointAddress(e.signal);
        const { host, path, port, secure } = endpoint;
        const peer = new PeerJS(local, { host, path, port, secure });
        const ref: NetworkRef = {
          id: local,
          peer,
          createdAt,
          signal: endpoint,
          connections: [],
        };
        refs[local] = ref;

        /**
         * Listen for incoming DATA connection requests.
         */
        peer.on('connection', (conn) => initDataConnection('incoming', ref, conn));
      }

      const ref = refs[local];
      bus.fire({
        type: 'PeerNetwork/create:res',
        payload: { ref: local, createdAt: ref.createdAt, signal: ref.signal },
      });
    });

  /**
   * STATUS
   */
  rx.payload<t.PeerNetworkStatusRequestEvent>($, 'PeerNetwork/status:req')
    .pipe()
    .subscribe((e) => {
      const ref = refs[e.ref];
      const network = ref ? toStatus(ref) : undefined;
      bus.fire({
        type: 'PeerNetwork/status:res',
        payload: { ref: e.ref, exists: Boolean(network), network },
      });
    });

  /**
   * PURGE
   */
  rx.payload<t.PeerNetworkPurgeReqEvent>($, 'PeerNetwork/purge:req')
    .pipe()
    .subscribe((e) => {
      const ref = refs[e.ref];
      const select = typeof e.select === 'object' ? e.select : { closedConnections: true };

      let changed = false;
      const purged: t.PeerNetworkPurgedDetail = {
        closedConnections: { data: 0, media: 0 },
      };

      const fire = (payload?: Partial<t.PeerNetworkPurgeRes>) => {
        bus.fire({
          type: 'PeerNetwork/purge:res',
          payload: { ref: e.ref, changed, purged, ...payload },
        });
      };
      const fireError = (message: string) => fire({ error: { message } });

      if (!ref) {
        const message = `The local PeerNetwork '${e.ref}' does not exist`;
        return fireError(message);
      }

      if (select.closedConnections) {
        const closed = ref.connections.filter((item) => !toConnectionStatus(item).isOpen);
        ref.connections = ref.connections.filter(({ id }) => !closed.some((c) => c.id === id));
        closed.forEach((item) => {
          changed = true;
          if (item.kind === 'data') purged.closedConnections.data++;
          if (item.kind === 'media') purged.closedConnections.data++;
        });
      }

      fire();
    });

  /**
   * CONNECT to a remote peer.
   */
  rx.payload<t.PeerNetworkConnectReqEvent>($, 'PeerNetwork/connect:req')
    .pipe()
    .subscribe((e) => {
      const { remote, kind, metadata } = e;
      const ref = refs[e.ref];

      const fire = (payload?: Partial<t.PeerNetworkConnectRes>) => {
        bus.fire({
          type: 'PeerNetwork/connect:res',
          payload: { kind, ref: e.ref, remote, direction: 'outgoing', ...payload },
        });
      };
      const fireError = (message: string) => fire({ error: { message } });

      if (!ref) {
        const message = `The local PeerNetwork '${e.ref}' does not exist`;
        return fireError(message);
      }

      if (ref.id === remote) {
        const message = `Cannot connect to self`;
        return fireError(message);
      }

      // Check for existing remote connection.
      const existing = ref.connections.find(
        (item) => item.kind === kind && item.id.remote === remote,
      );
      if (existing) {
        return fire();
      }

      if (e.kind === 'data') {
        const { reliable } = e;
        const conn = ref.peer.connect(remote, { reliable, metadata });
        const errorMonitor = PeerJSError(ref.peer);

        conn.on('open', () => {
          // Success.
          //  - Connected to the remote peer.
          errorMonitor.dispose();
          initDataConnection('outgoing', ref, conn);
        });

        // Listen for a connection error.
        // Will happen on timeout (remote peer not found on the network)
        errorMonitor.$.pipe(
          filter((err) => err.type === 'peer-unavailable'),
          filter((err) => err.message.includes(`peer ${remote}`)),
          take(1),
        ).subscribe((err) => {
          errorMonitor.dispose();
          fireError(`Failed to connect to peer '${remote}'. The remote target did not respond.`);
        });
      }

      if (e.kind === 'media') {
        /**
         * TODO 🐷
         */
        throw new Error('Not implemented');
      }
    });

  /**
   * DISCONNECT from a remote peer.
   */
  rx.payload<t.PeerNetworkDisconnectReqEvent>($, 'PeerNetwork/disconnect:req')
    .pipe()
    .subscribe((e) => {
      const { remote } = e;
      const networkRef = refs[e.ref];

      const fire = (payload?: Partial<t.PeerNetworkDisconnectRes>) => {
        bus.fire({
          type: 'PeerNetwork/disconnect:res',
          payload: { ref: e.ref, remote, ...payload },
        });
      };
      const fireError = (message: string) => fire({ error: { message } });

      if (!networkRef) {
        const message = `The local PeerNetwork '${e.ref}' does not exist`;
        return fireError(message);
      }

      const connRef = networkRef.connections.find((item) => item.id.remote === e.remote);
      if (!connRef) {
        const message = `The remote connection '${remote}' does not exist`;
        return fireError(message);
      }

      connRef.conn.close();
      fire();
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
