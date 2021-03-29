import { Subject, merge } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import { deleteUndefined, PeerJS, rx, t, time } from '../../common';

import { PeerJSError } from './util';

type ConnectionKind = t.PeerNetworkConnectRes['kind'];

type SelfRefs = { [id: string]: SelfRef };
type SelfRef = {
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
  const bus = args.bus.type<t.PeerNetworkEvent>();
  const $ = bus.event$.pipe(takeUntil(dispose$));
  const selfRefs: SelfRefs = {};

  /**
   * Add a new network-connection reference.
   */
  const addConnectionRef = (
    kind: ConnectionKind,
    self: SelfRef,
    conn: PeerJS.DataConnection | PeerJS.MediaConnection,
    media?: MediaStream,
  ) => {
    const existing = self.connections.find((item) => item.conn === conn);
    if (existing) return existing;

    const local = self.peer.id;
    const remote = conn.peer;
    const ref: ConnectionRef = { kind, id: { local, remote }, conn, media };
    self.connections = [...self.connections, ref];
    return ref;
  };

  const removeConnectionRef = (
    self: SelfRef,
    conn: PeerJS.DataConnection | PeerJS.MediaConnection,
  ) => {
    self.connections = self.connections.filter((item) => item.conn !== conn);
  };

  const getConnectionRef = (
    self: SelfRef,
    conn: t.PeerNetworkId | PeerJS.DataConnection | PeerJS.MediaConnection,
  ) => {
    const remote = typeof conn === 'string' ? conn : conn.peer;
    const ref = self.connections.find((ref) => ref.id.remote === remote);
    if (!ref) {
      const err = `The connection reference '${remote}' for local network '${self.id}' has not been added`;
      throw new Error(err);
    }
    return ref;
  };

  /**
   * Convert a "local network client" to an immutable status object.
   */
  const toStatus = (self: SelfRef): t.PeerNetworkStatus => {
    const { peer, createdAt, signal, media } = self;
    const id = peer.id;
    const connections = self.connections.map((item) => toConnectionStatus(item));
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
    self: SelfRef,
    conn: PeerJS.DataConnection | PeerJS.MediaConnection,
  ) => {
    const connectionRef = getConnectionRef(self, conn);

    bus.fire({
      type: 'PeerNetwork/connect:res',
      payload: {
        ref: self.id,
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
        payload: { ref: self.id, connection },
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
      if (!selfRefs[e.ref]) {
        const createdAt = time.now.timestamp;
        const endpoint = parseEndpointAddress(e.signal);
        const { host, path, port, secure } = endpoint;
        const peer = new PeerJS(e.ref, { host, path, port, secure });
        const ref: SelfRef = {
          id: e.ref,
          peer,
          createdAt,
          signal: endpoint,
          connections: [],
          media: {},
        };
        selfRefs[e.ref] = ref;

        // Listen for incoming DATA connection requests.
        peer.on('connection', (dataConnection) => {
          addConnectionRef('data', ref, dataConnection);
          completeConnection('data', 'incoming', ref, dataConnection);
        });

        // Listen for incoming MEDIA (video) connection requests.
        peer.on('call', (mediaConnection) => {
          addConnectionRef('media', ref, mediaConnection);
          completeConnection('media', 'incoming', ref, mediaConnection);
        });
      }

      const self = selfRefs[e.ref];

      bus.fire({
        type: 'PeerNetwork/init:res',
        payload: { ref: e.ref, createdAt: self.createdAt, signal: self.signal },
      });
    });

  /**
   * STATUS
   */
  rx.payload<t.PeerNetworkStatusRequestEvent>($, 'PeerNetwork/status:req')
    .pipe()
    .subscribe((e) => {
      const self = selfRefs[e.ref];
      const status = self ? toStatus(self) : undefined;
      const exists = Boolean(status);
      bus.fire({
        type: 'PeerNetwork/status:res',
        payload: { ref: e.ref, exists, self: status },
      });
    });

  merge(
    $.pipe(
      filter((e) => {
        const types: t.PeerNetworkEvent['type'][] = [
          'PeerNetwork/init:res',
          'PeerNetwork/connect:res',
          'PeerNetwork/purge:res',
          'PeerNetwork/connection:closed',
        ];
        return types.includes(e.type);
      }),
    ),
  ).subscribe((event) => {
    const ref = event.payload.ref;
    const self = selfRefs[ref];
    if (self) {
      const status = toStatus(self);
      bus.fire({
        type: 'PeerNetwork/status:changed',
        payload: { ref, self: status, event },
      });
    }
  });

  /**
   * PURGE
   */
  rx.payload<t.PeerNetworkPurgeReqEvent>($, 'PeerNetwork/purge:req')
    .pipe()
    .subscribe((e) => {
      const self = selfRefs[e.ref];
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

      if (!self) {
        const message = `The local PeerNetwork '${e.ref}' does not exist`;
        return fireError(message);
      }

      if (select.closedConnections) {
        const closed = self.connections.filter((item) => !toConnectionStatus(item).isOpen);
        self.connections = self.connections.filter(({ id }) => !closed.some((c) => c.id === id));
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
      const self = selfRefs[e.ref];

      const fire = (payload?: Partial<t.PeerNetworkConnectRes>) => {
        bus.fire({
          type: 'PeerNetwork/connect:res',
          payload: { kind, ref: e.ref, remote, direction: 'outgoing', ...payload },
        });
      };
      const fireError = (message: string) => fire({ error: { message } });

      if (!self) {
        const message = `The local PeerNetwork '${e.ref}' does not exist`;
        return fireError(message);
      }

      if (self.id === remote) {
        const message = `Cannot connect to self`;
        return fireError(message);
      }

      // Check for existing remote connection.
      const isMatch = (item: ConnectionRef) => item.kind === kind && item.id.remote === remote;
      if (self.connections.find(isMatch)) return fire();

      // Start a data connection.
      if (e.kind === 'data') {
        const { reliable, metadata } = e;
        const errorMonitor = PeerJSError(self.peer);
        const dataConnection = self.peer.connect(remote, { reliable, metadata });
        addConnectionRef(e.kind, self, dataConnection);

        dataConnection.on('open', () => {
          // SUCCESS: Connected to the remote peer.
          errorMonitor.dispose();
          completeConnection(e.kind, 'outgoing', self, dataConnection);
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
          removeConnectionRef(self, dataConnection);
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
      const selfRef = selfRefs[e.ref];

      const fire = (payload?: Partial<t.PeerNetworkDisconnectRes>) => {
        bus.fire({
          type: 'PeerNetwork/disconnect:res',
          payload: { ref: e.ref, remote, ...payload },
        });
      };
      const fireError = (message: string) => fire({ error: { message } });

      if (!selfRef) {
        const message = `The local PeerNetwork '${e.ref}' does not exist`;
        return fireError(message);
      }

      const connRef = selfRef.connections.find((item) => item.id.remote === e.remote);
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
      Object.keys(selfRefs).forEach((key) => selfRefs[key]);
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
