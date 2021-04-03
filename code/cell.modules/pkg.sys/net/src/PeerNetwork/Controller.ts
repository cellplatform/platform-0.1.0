import { merge } from 'rxjs';
import { delay, filter, take } from 'rxjs/operators';

import { asArray, deleteUndefined, PeerJS, rx, slug, t, time, defaultValue } from '../common';
import { Events } from './Events';
import { ConnectionRef, MemoryRefs, SelfRef } from './Refs';
import { PeerJSError, StringUtil } from './util';

type ConnectionKind = t.PeerNetworkConnectRes['kind'];

/**
 * EventBus contoller for a WebRTC [Peer] connection.
 */
export function Controller(args: { bus: t.EventBus<any> }) {
  const bus = args.bus.type<t.PeerEvent>();
  const events = Events({ bus });
  const $ = events.$;

  const refs = MemoryRefs();

  const dispose = () => {
    events.dispose();
    refs.dispose();
    window.removeEventListener('online', handleOnlineStatusChanged);
    window.removeEventListener('offline', handleOnlineStatusChanged);
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
      const media = ref.remoteStream as MediaStream;
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
    tx?: string,
  ) => {
    const connectionRef = refs.connection(self).get(conn);
    tx = tx || slug();

    bus.fire({
      type: 'Peer:Connection/connect:res',
      payload: {
        self: self.id,
        tx,
        kind,
        direction,
        existing: false,
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
        const signal = StringUtil.parseEndpointAddress(e.signal);
        const { host, path, port, secure } = signal;
        const peer = new PeerJS(e.self, { host, path, port, secure });
        const self: SelfRef = {
          id: e.self,
          peer,
          createdAt,
          signal,
          connections: [],
          media: {},
        };
        refs.self[e.self] = self;

        // Listen for incoming DATA connection requests.
        peer.on('connection', (dataConnection) => {
          dataConnection.on('open', () => {
            refs.connection(self).add('data', dataConnection);
            completeConnection('data', 'incoming', self, dataConnection);
          });
        });

        // Listen for incoming MEDIA (video/screen) connection requests.
        peer.on('call', async (mediaConnection) => {
          const metadata = (mediaConnection.metadata || {}) as t.PeerConnectionMetadataMedia;
          const { kind, constraints } = metadata;
          const local = await events.media(self.id).request({ kind, constraints });
          if (local.media) {
            mediaConnection.answer(local.media);
            refs.connection(self).add('media', mediaConnection);
            completeConnection('media', 'incoming', self, mediaConnection);
          }
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
    .subscribe(async (e) => {
      const { remote } = e;
      const self = refs.self[e.self];
      const tx = e.tx || slug();

      const fire = (payload?: Partial<t.PeerNetworkConnectRes>) => {
        const kind = e.kind === 'data' ? 'data' : 'media';
        const existing = Boolean(payload?.existing);
        bus.fire({
          type: 'Peer:Connection/connect:res',
          payload: { kind, self: e.self, tx, remote, direction: 'outgoing', existing, ...payload },
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
      const isMatch = (item: ConnectionRef) => item.kind === e.kind && item.id.remote === remote;
      if (self.connections.find(isMatch)) {
        return fire({ existing: true });
      }

      // Start a data connection.
      if (e.kind === 'data') {
        const { isReliable: reliable } = e;
        const errorMonitor = PeerJSError(self.peer);
        const dataConnection = self.peer.connect(remote, { reliable });
        refs.connection(self).add('data', dataConnection);

        dataConnection.on('open', () => {
          // SUCCESS: Connected to the remote peer.
          errorMonitor.dispose();
          completeConnection('data', 'outgoing', self, dataConnection, tx);
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
      if (e.kind === 'video' || e.kind === 'screen') {
        const { constraints } = e;

        // Retrieve the media stream.
        const res = await events.media(self.id).request({ kind: e.kind, constraints });
        const localStream = res.media;
        if (res.error || !localStream) {
          const err = res.error?.message || `Failed to retrieve a local media stream (${self.id}).`;
          return fireError(err);
        }

        // Start the network/peer connection.
        const metadata: t.PeerConnectionMetadataMedia = { kind: e.kind, constraints };
        const mediaConnection = self.peer.call(remote, localStream, { metadata });
        const connRef = refs.connection(self).add('media', mediaConnection);
        connRef.localStream = localStream;

        // Manage timeout.
        const msecs = defaultValue(e.timeout, 10 * 1000);
        const timeout = time.delay(msecs, () => {
          refs.connection(self).remove(mediaConnection);
          const err = `Failed to connect [${e.kind}] to peer '${remote}'. The connection attempt timed out.`;
          fireError(err);
        });

        mediaConnection.on('stream', (remoteStream) => {
          if (timeout.isCancelled) return;
          timeout.cancel();
          connRef.remoteStream = remoteStream;
          completeConnection('media', 'outgoing', self, mediaConnection, tx);
        });
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
    dispose$: events.dispose$,
    dispose,
  };
}
