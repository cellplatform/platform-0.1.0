import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import { deleteUndefined, PeerJS, rx, t, time, defaultValue, cuid } from '../../common';

import { PeerJSError } from './util';

type ConnectionKind = t.PeerNetworkConnectRes['kind'];
type NetworkRefs = { [id: string]: NetworkRef };
type NetworkRef = {
  id: string;
  peer: PeerJS;
  createdAt: number;
  signal: t.PeerNetworkSignalEndpoint;
  connections: ConnectionRef[];
  media: { video?: MediaStream; screen?: MediaStream };
};

type ConnectionRef = {
  kind: 'data' | 'media';
  id: t.PeerConnectionStatus['id'];
  conn: PeerJS.DataConnection | PeerJS.MediaConnection;
  media?: MediaStream;
};

/**
 * EventBus contoller for a WebRTC [Peer] connection.
 */
export function PeerNetworkController(args: { bus: t.EventBus<any> }) {
  const dispose$ = new Subject<void>();
  const bus = args.bus.type<t.PeerNetworkEvent | t.MediaEvent>();
  const $ = bus.event$.pipe(takeUntil(dispose$));

  const refs: NetworkRefs = {};

  /**
   * Add a new network-connection reference.
   */
  const addConnectionRef = (
    kind: ConnectionKind,
    network: NetworkRef,
    conn: PeerJS.DataConnection | PeerJS.MediaConnection,
    media?: MediaStream,
  ) => {
    const existing = network.connections.find((item) => item.conn === conn);
    if (existing) return existing;

    const local = network.peer.id;
    const remote = conn.peer;
    const ref: ConnectionRef = { kind, id: { local, remote }, conn, media };
    network.connections = [...network.connections, ref];
    return ref;
  };

  const removeConnectionRef = (
    network: NetworkRef,
    conn: PeerJS.DataConnection | PeerJS.MediaConnection,
  ) => {
    network.connections = network.connections.filter((item) => item.conn !== conn);
  };

  const getConnectionRef = (
    network: NetworkRef,
    conn: t.PeerNetworkId | PeerJS.DataConnection | PeerJS.MediaConnection,
  ) => {
    const remote = typeof conn === 'string' ? conn : conn.peer;
    const ref = network.connections.find((ref) => ref.id.remote === remote);
    if (!ref) {
      const err = `The connection reference '${remote}' for local network '${network.id}' has not been added`;
      throw new Error(err);
    }
    return ref;
  };

  /**
   * Convert a "local network client" to an immutable status object.
   */
  const toStatus = (ref: NetworkRef): t.PeerNetworkStatus => {
    const { peer, createdAt, signal, media } = ref;
    const id = peer.id;
    const connections = ref.connections.map((item) => toConnectionStatus(item));
    return deleteUndefined({ id, createdAt, signal, media, connections });
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
      const media = ref.media as MediaStream;
      const conn = ref.conn as PeerJS.MediaConnection;
      const { open: isOpen, metadata } = conn;
      return { id, kind, isOpen, metadata, media };
    }

    throw new Error(`Kind of connection not supported: '${kind}' (${id})`);
  };

  /**
   * Initialize a new PeerJS data-connection.
   */
  const completeConnection = (
    kind: ConnectionKind,
    direction: t.PeerNetworkConnectRes['direction'],
    network: NetworkRef,
    conn: PeerJS.DataConnection | PeerJS.MediaConnection,
  ) => {
    const connectionRef = getConnectionRef(network, conn);

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
      const connection = toConnectionStatus(connectionRef);
      bus.fire({
        type: 'PeerNetwork/connection:closed',
        payload: { ref: network.id, connection },
      });
    });

    return connectionRef;
  };

  /**
   * CREATE a new network client.
   */
  rx.payload<t.PeerNetworkInitReqEvent>($, 'PeerNetwork/init:req')
    .pipe()
    .subscribe((e) => {
      if (!refs[e.ref]) {
        const createdAt = time.now.timestamp;
        const endpoint = parseEndpointAddress(e.signal);
        const { host, path, port, secure } = endpoint;
        const peer = new PeerJS(e.ref, { host, path, port, secure });
        const ref: NetworkRef = {
          id: e.ref,
          peer,
          createdAt,
          signal: endpoint,
          connections: [],
          media: {},
        };
        refs[e.ref] = ref;

        // Listen for incoming DATA connection requests.
        peer.on('connection', (dataConnection) => {
          addConnectionRef('data', ref, dataConnection);
          completeConnection('data', 'incoming', ref, dataConnection);
          // time.delay(100, () => {
          // });
        });

        /**
         * TODO 🐷
         */

        // Listen for incoming MEDIA (video) connection requests.
        peer.on('call', (mediaConnection) => {
          addConnectionRef('media', ref, mediaConnection);
          completeConnection('media', 'incoming', ref, mediaConnection);
        });
      }

      const ref = refs[e.ref];

      bus.fire({
        type: 'PeerNetwork/init:res',
        payload: { ref: e.ref, createdAt: ref.createdAt, signal: ref.signal },
      });
    });

  /**
   * SELF (update)
   */
  rx.payload<t.PeerNetworkSelfUpdateEvent>($, 'PeerNetwork/self')
    .pipe()
    .subscribe((e) => {
      const ref = refs[e.ref];
      if (!ref) return;
      if (e.video === null) ref.media.video = undefined;
      if (e.video) ref.media.video = e.video;
      ref.media = deleteUndefined(ref.media);
    });

  /**
   * STATUS
   */
  rx.payload<t.PeerNetworkStatusRequestEvent>($, 'PeerNetwork/status:req')
    .pipe()
    .subscribe((e) => {
      const ref = refs[e.ref];
      const self = ref ? toStatus(ref) : undefined;
      const tx = e.tx || cuid();
      bus.fire({
        type: 'PeerNetwork/status:res',
        payload: { ref: e.ref, tx, exists: Boolean(self), self },
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
      const purged: t.PeerNetworkPurged = {
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
   * CONNECT: Outgoing
   */
  rx.payload<t.PeerNetworkConnectReqEvent>($, 'PeerNetwork/connect:req')
    .pipe(filter((e) => e.direction === 'outgoing'))
    .subscribe((e) => {
      const { remote, kind } = e;
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
      if (existing) return fire();

      // Start a data connection.
      if (e.kind === 'data') {
        const { reliable, metadata } = e;
        const errorMonitor = PeerJSError(ref.peer);
        const dataConnection = ref.peer.connect(remote, { reliable, metadata });
        addConnectionRef(e.kind, ref, dataConnection);

        dataConnection.on('open', () => {
          // SUCCESS: Connected to the remote peer.
          errorMonitor.dispose();
          completeConnection(e.kind, 'outgoing', ref, dataConnection);
        });

        // Listen for a connection error.
        // Will happen on timeout (remote peer not found on the network)
        errorMonitor.$.pipe(
          filter((err) => err.type === 'peer-unavailable'),
          filter((err) => err.message.includes(`peer ${remote}`)),
          take(1),
        ).subscribe((err) => {
          // FAIL
          errorMonitor.dispose();
          removeConnectionRef(ref, dataConnection);
          fireError(`Failed to connect to peer '${remote}'. The remote target did not respond.`);
        });
      }

      // Start a media (video) call.
      if (e.kind === 'media') {
        const { metadata } = e;
        // const outgoingStream = e.media;
        // const mediaConnection = ref.peer.call(remote, outgoingStream, { metadata });
        // const connRef = addConnectionRef(e.kind, ref, mediaConnection);

        // const msecs = defaultValue(e.timeout, 10000);
        // const timeout = time.delay(msecs, () => {
        //   removeConnectionRef(ref, mediaConnection);
        //   fireError(`Failed to connect to peer '${remote}'. The connection attempt timed out.`);
        // });

        // mediaConnection.on('stream', (remoteStream) => {
        //   if (timeout.isCancelled) return;
        //   timeout.cancel();
        //   connRef.media = remoteStream;
        //   completeConnection(e.kind, 'outgoing', ref, mediaConnection);
        // });

        /**
         * TODO 🐷
         */
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
