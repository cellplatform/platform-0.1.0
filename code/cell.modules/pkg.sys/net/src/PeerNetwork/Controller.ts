import { Subject, merge } from 'rxjs';
import { filter, take, takeUntil, delay } from 'rxjs/operators';
import { deleteUndefined, PeerJS, rx, t, time, slug } from '../common';
import { PeerJSError, Strings } from './util';
import { MemoryRefs, SelfRef, ConnectionRef } from './Refs';
import { asArray } from '@platform/util.value/lib/value/value.array';

type ConnectionKind = t.PeerNetworkConnectRes['kind'];

/**
 * EventBus contoller for a WebRTC [Peer] connection.
 */
export function Controller(args: { bus: t.EventBus<any> }) {
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
        type: 'Peer:Local/online:changed',
        payload: { self: ref, isOnline: navigator.onLine },
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
      isOnline: navigator.onLine,
      createdAt,
      signal,
      media,
      connections,
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
    const tx = slug();

    bus.fire({
      type: 'Peer:Connection/connect:res',
      payload: {
        self: self.id,
        tx,
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
        payload: { self: self.id, connection },
      });
    });

    if (kind === 'data') {
      const data = conn as PeerJS.DataConnection;
      data.on('data', (data: t.JsonMap) => {
        if (typeof data === 'object') {
          const e = data as t.PeerDataSend;
          bus.fire({
            type: 'Peer:Data/received',
            payload: { self: self.id, data: e.data, from: e.self, to: asArray(e.target || []) },
          });
        }
      });
    }

    return connectionRef;
  };

  /**
   * CREATE a new network client.
   */
  rx.payload<t.PeerLocalInitReqEvent>($, 'Peer:Local/init:req')
    .pipe(delay(0))
    .subscribe((e) => {
      if (!refs.self[e.self]) {
        const createdAt = time.now.timestamp;
        const signal = Strings.parseEndpointAddress(e.signal);
        const { host, path, port, secure } = signal;
        const peer = new PeerJS(e.self, { host, path, port, secure });
        const ref: SelfRef = {
          id: e.self,
          peer,
          createdAt,
          signal,
          connections: [],
          media: {},
        };
        refs.self[e.self] = ref;

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

      const self = refs.self[e.self];

      bus.fire({
        type: 'Peer:Local/init:res',
        payload: { self: e.self, createdAt: self.createdAt, signal: self.signal },
      });
    });

  /**
   * STATUS
   */
  rx.payload<t.PeerLocalStatusRequestEvent>($, 'Peer:Local/status:req')
    .pipe(delay(0))
    .subscribe((e) => {
      const tx = e.tx || slug();
      const self = refs.self[e.self];
      const network = self ? toStatus(self) : undefined;
      const exists = Boolean(network);
      bus.fire({
        type: 'Peer:Local/status:res',
        payload: { self: e.self, tx, exists, network },
      });
    });

  /**
   * STATUS CHANGE
   */
  const statusChanged$ = merge(
    $.pipe(
      filter((e) => {
        const types: t.PeerEvent['type'][] = [
          'Peer:Local/init:res',
          'Peer:Local/purge:res',
          'Peer:Local/online:changed',
          'Peer:Connection/connect:res',
          'Peer:Connection/closed',
        ];
        return types.includes(e.type);
      }),
    ),
  );

  statusChanged$.pipe().subscribe((event) => {
    const ref = event.payload.self;
    const self = refs.self[ref];
    if (self) {
      bus.fire({
        type: 'Peer:Local/status:changed',
        payload: { self: ref, network: toStatus(self), event },
      });
    }
  });

  /**
   * PURGE
   */
  rx.payload<t.PeerLocalPurgeReqEvent>($, 'Peer:Local/purge:req')
    .pipe()
    .subscribe((e) => {
      const tx = e.tx || slug();
      const self = refs.self[e.self];
      const select = typeof e.select === 'object' ? e.select : { closedConnections: true };

      let changed = false;
      const purged: t.PeerLocalPurged = {
        closedConnections: { data: 0, media: 0 },
      };

      const fire = (payload?: Partial<t.PeerLocalPurgeRes>) => {
        bus.fire({
          type: 'Peer:Local/purge:res',
          payload: { self: e.self, tx, changed, purged, ...payload },
        });
      };
      const fireError = (message: string) => fire({ error: { message } });

      if (!self) {
        const message = `The local PeerNetwork '${e.self}' does not exist`;
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
      const self = refs.self[e.self];
      const tx = e.tx || slug();

      const fire = (payload?: Partial<t.PeerNetworkConnectRes>) => {
        bus.fire({
          type: 'Peer:Connection/connect:res',
          payload: { kind, self: e.self, tx, remote, direction: 'outgoing', ...payload },
        });
      };
      const fireError = (message: string) => fire({ error: { message } });

      if (!self) {
        const message = `The local PeerNetwork '${e.self}' does not exist`;
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
        const { isReliable: reliable, metadata } = e;
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
      const selfRef = refs.self[e.self];
      const tx = e.tx || slug();

      const fire = (payload?: Partial<t.PeerNetworkDisconnectRes>) => {
        bus.fire({
          type: 'Peer:Connection/disconnect:res',
          payload: { self: e.self, tx, remote, ...payload },
        });
      };
      const fireError = (message: string) => fire({ error: { message } });

      if (!selfRef) {
        const message = `The local PeerNetwork '${e.self}' does not exist`;
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
      if (target.length === 0) target.push(...refs.connection(e.self).ids);
      refs
        .connection(e.self)
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
