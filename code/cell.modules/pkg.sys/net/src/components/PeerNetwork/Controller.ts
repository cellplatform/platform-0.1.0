import { Subject, merge } from 'rxjs';
import { filter, take, takeUntil, delay } from 'rxjs/operators';
import { deleteUndefined, PeerJS, rx, t, time } from '../../common';
import { PeerJSError } from './util';
import { MemoryRefs, SelfRef, ConnectionRef } from './Refs';
import { asArray } from '@platform/util.value/lib/value/value.array';

type ConnectionKind = t.PeerNetworkConnectRes['kind'];

/**
 * EventBus contoller for a WebRTC [Peer] connection.
 */
export function PeerController(args: { bus: t.EventBus<any> }) {
  const dispose$ = new Subject<void>();
  const bus = args.bus.type<t.PeerEvent>();
  const $ = bus.event$.pipe(takeUntil(dispose$));
  const refs = MemoryRefs();

  const dispose = () => {
    dispose$.next();
    window.removeEventListener('online', handleOnlineStatusChanged);
    window.removeEventListener('offline', handleOnlineStatusChanged);
    refs.dispose();
  };

  /**
   * Monitor network connectivity.
   */
  const handleOnlineStatusChanged = (e: Event) => {
    Object.keys(refs.self).forEach((ref) => {
      bus.fire({
        type: 'Peer:Network/online:changed',
        payload: { ref, isOnline: navigator.onLine },
      });
    });
  };
  window.addEventListener('online', handleOnlineStatusChanged);
  window.addEventListener('offline', handleOnlineStatusChanged);

  /**
   * Convert a "local network client" to an immutable status object.
   */
  const toStatus = (self: SelfRef): t.PeerNetworkStatus => {
    const { peer, createdAt, signal, media } = self;
    const id = peer.id;
    const connections = self.connections.map((item) => toConnectionStatus(item));
    return deleteUndefined({
      id,
      createdAt,
      signal,
      media,
      connections,
      isOnline: navigator.onLine,
    });
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
    const connectionRef = refs.connection(self).get(conn);

    bus.fire({
      type: 'Peer:Connection/connect:res',
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
        type: 'Peer:Connection/closed',
        payload: { ref: self.id, connection },
      });
    });

    if (kind === 'data') {
      const data = conn as PeerJS.DataConnection;
      data.on('data', (data: t.JsonMap) => {
        if (typeof data === 'object') {
          const e = data as t.PeerDataSend;
          bus.fire({
            type: 'Peer:Data/received',
            payload: { ref: self.id, data: e.data, from: e.ref, to: asArray(e.target || []) },
          });
        }
      });
    }

    return connectionRef;
  };

  /**
   * CREATE a new network client.
   */
  rx.payload<t.PeerNetworkInitReqEvent>($, 'Peer:Network/init:req')
    .pipe(delay(0))
    .subscribe((e) => {
      if (!refs.self[e.ref]) {
        const createdAt = time.now.timestamp;
        const signal = parseEndpointAddress(e.signal);
        const { host, path, port, secure } = signal;
        const peer = new PeerJS(e.ref, { host, path, port, secure });
        const ref: SelfRef = {
          id: e.ref,
          peer,
          createdAt,
          signal,
          connections: [],
          media: {},
        };
        refs.self[e.ref] = ref;

        // Listen for incoming DATA connection requests.
        peer.on('connection', (dataConnection) => {
          dataConnection.on('open', () => {
            refs.connection(ref).add('data', dataConnection);
            completeConnection('data', 'incoming', ref, dataConnection);
          });
        });

        // Listen for incoming MEDIA (video) connection requests.
        peer.on('call', (mediaConnection) => {
          refs.connection(ref).add('media', mediaConnection);
          completeConnection('media', 'incoming', ref, mediaConnection);
        });
      }

      const self = refs.self[e.ref];

      bus.fire({
        type: 'Peer:Network/init:res',
        payload: { ref: e.ref, createdAt: self.createdAt, signal: self.signal },
      });
    });

  /**
   * STATUS
   */
  rx.payload<t.PeerNetworkStatusRequestEvent>($, 'Peer:Network/status:req')
    .pipe(delay(0))
    .subscribe((e) => {
      const self = refs.self[e.ref];
      const status = self ? toStatus(self) : undefined;
      const exists = Boolean(status);
      bus.fire({
        type: 'Peer:Network/status:res',
        payload: { ref: e.ref, exists, self: status },
      });
    });

  /**
   * STATUS CHANGE
   */
  const statusChanged$ = merge(
    $.pipe(
      filter((e) => {
        const types: t.PeerEvent['type'][] = [
          'Peer:Network/init:res',
          'Peer:Network/purge:res',
          'Peer:Network/online:changed',
          'Peer:Connection/connect:res',
          'Peer:Connection/closed',
        ];
        return types.includes(e.type);
      }),
    ),
  );

  statusChanged$.pipe().subscribe((event) => {
    const ref = event.payload.ref;
    const self = refs.self[ref];
    if (self) {
      bus.fire({
        type: 'Peer:Network/status:changed',
        payload: { ref, self: toStatus(self), event },
      });
    }
  });

  /**
   * PURGE
   */
  rx.payload<t.PeerNetworkPurgeReqEvent>($, 'Peer:Network/purge:req')
    .pipe()
    .subscribe((e) => {
      const self = refs.self[e.ref];
      const select = typeof e.select === 'object' ? e.select : { closedConnections: true };

      let changed = false;
      const purged: t.PeerNetworkPurged = {
        closedConnections: { data: 0, media: 0 },
      };

      const fire = (payload?: Partial<t.PeerNetworkPurgeRes>) => {
        bus.fire({
          type: 'Peer:Network/purge:res',
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
  rx.payload<t.PeerConnectReqEvent>($, 'Peer:Connection/connect:req')
    .pipe(filter((e) => e.direction === 'outgoing'))
    .subscribe((e) => {
      const { remote, kind } = e;
      const self = refs.self[e.ref];

      const fire = (payload?: Partial<t.PeerNetworkConnectRes>) => {
        bus.fire({
          type: 'Peer:Connection/connect:res',
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
        refs.connection(self).add(e.kind, dataConnection);

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
          refs.connection(self).remove(dataConnection);
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
  rx.payload<t.PeerDisconnectReqEvent>($, 'Peer:Connection/disconnect:req')
    .pipe()
    .subscribe((e) => {
      const { remote } = e;
      const selfRef = refs.self[e.ref];

      const fire = (payload?: Partial<t.PeerNetworkDisconnectRes>) => {
        bus.fire({
          type: 'Peer:Connection/disconnect:res',
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

  /**
   * DATA: Send
   */
  rx.payload<t.PeerDataSendEvent>($, 'Peer:Data/send')
    .pipe()
    .subscribe((e) => {
      const target = e.target === undefined ? [] : asArray(e.target);
      if (target.length === 0) target.push(...refs.connection(e.ref).ids);
      refs
        .connection(e.ref)
        .data.filter((conn) => (!e.target ? true : target.includes(conn.peer)))
        .forEach((conn) => conn.send({ ...e, target }));
    });

  return {
    dispose$: dispose$.asObservable(),
    dispose,
    get isDisposed() {
      return dispose$.closed;
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
