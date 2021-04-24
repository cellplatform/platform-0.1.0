import { merge } from 'rxjs';
import { delay, distinctUntilChanged, filter, map, take } from 'rxjs/operators';

import {
  asArray,
  defaultValue,
  PeerJS,
  PeerJSError,
  R,
  rx,
  slug,
  StreamUtil,
  StringUtil,
  t,
  time,
  WebRuntime,
} from './common';
import { Events } from './event';
import { MemoryRefs, SelfRef } from './Refs';
import { Status } from './Status';

type ConnectionKind = t.PeerNetworkConnectRes['kind'];

/**
 * EventBus contoller for a WebRTC [Peer] connection.
 */
export function Controller(args: { bus: t.EventBus<any> }) {
  const bus = args.bus.type<t.PeerEvent>();
  const events = Events(bus);
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
        type: 'sys.net/peer/local/online:changed',
        payload: { self: ref, isOnline: navigator.onLine },
      });
    });
  };
  window.addEventListener('online', handleOnlineStatusChanged);
  window.addEventListener('offline', handleOnlineStatusChanged);

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
    const connRef = refs.connection(self).get(conn);
    tx = tx || slug();

    bus.fire({
      type: 'sys.net/peer/conn/connect:res',
      payload: {
        self: self.id,
        tx,
        kind,
        direction,
        existing: false,
        remote: connRef.peer.remote.id,
        connection: Status.toConnection(connRef),
      },
    });

    conn.on('close', async () => {
      /**
       * NOTE:
       * The close event is not being fired for [Media] connections.
       * Issue: https://github.com/peers/peerjs/issues/780
       *
       * See work-around that uses the [netbus] "connection.ensureClosed" strategy.
       */
      const peer = connRef.peer;
      events.connection(peer.self, peer.remote.id).close(connRef.id);
    });

    if (kind === 'data') {
      const data = conn as PeerJS.DataConnection;
      data.on('data', (data: t.JsonMap) => {
        if (typeof data === 'object') {
          const e = data as t.PeerDataOut;
          const target = asArray(e.target || []);
          bus.fire({
            type: 'sys.net/peer/data/in',
            payload: { self: self.id, data: e.data, source: e.self, target },
          });
        }
      });
    }

    return connRef;
  };

  const initLocalPeer = (e: t.PeerLocalCreateReq) => {
    const createdAt = time.now.timestamp;
    const signal = StringUtil.parseEndpointAddress(e.signal);
    const { host, path, port, secure } = signal;
    const peer = new PeerJS(e.self, { host, path, port, secure });
    const self: SelfRef = { id: e.self, peer, createdAt, signal, connections: [], media: {} };

    /**
     * Listen for incoming DATA connection requests.
     */
    peer.on('connection', (dataConnection) => {
      dataConnection.on('open', () => {
        refs.connection(self).add('data', 'incoming', dataConnection);
        completeConnection('data', 'incoming', self, dataConnection);
      });
    });

    /**
     * Listen for incoming MEDIA connection requests (video/screen).
     */
    peer.on('call', async (mediaConnection) => {
      const metadata = (mediaConnection.metadata || {}) as t.PeerConnectionMetadataMedia;
      const { kind, constraints } = metadata;

      const answer = (localStream?: MediaStream) => {
        mediaConnection.answer(localStream);
        mediaConnection.on('stream', (remoteStream) => {
          refs.connection(self).add(kind, 'incoming', mediaConnection, remoteStream);
          completeConnection(kind, 'incoming', self, mediaConnection);
        });
      };

      if (kind === 'media/video') {
        const local = await events.media(self.id).request({ kind, constraints });
        answer(local.media);
      }

      if (kind === 'media/screen') {
        // NB: Screen shares do not send back another stream so do
        //     not request it from the user.
        answer();
      }
    });

    // Finish up.
    return self;
  };

  /**
   * CREATE a new network client.
   */
  rx.payload<t.PeerLocalInitReqEvent>($, 'sys.net/peer/local/init:req')
    .pipe(delay(0))
    .subscribe((e) => {
      const id = e.self;
      if (!refs.self[id]) refs.self[id] = initLocalPeer(e);
      const self = refs.self[id];
      bus.fire({
        type: 'sys.net/peer/local/init:res',
        payload: { self: e.self, createdAt: self.createdAt, signal: self.signal },
      });
    });

  /**
   * STATUS
   */
  rx.payload<t.PeerLocalStatusRequestEvent>($, 'sys.net/peer/local/status:req')
    .pipe(delay(0))
    .subscribe((e) => {
      const tx = e.tx || slug();
      const self = refs.self[e.self];
      const peer = self ? Status.toSelf(self) : undefined;
      const exists = Boolean(peer);
      bus.fire({
        type: 'sys.net/peer/local/status:res',
        payload: { self: e.self, tx, exists, peer },
      });
    });

  /**
   * STATUS CHANGE
   */
  const statusChanged$ = merge(
    $.pipe(
      filter((e) => {
        const types: t.PeerEvent['type'][] = [
          'sys.net/peer/local/init:res',
          'sys.net/peer/local/purge:res',
          'sys.net/peer/local/online:changed',
          'sys.net/peer/conn/connect:res',
          'sys.net/peer/conn/disconnect:res',
        ];
        return types.includes(e.type);
      }),
    ),
  ).pipe(
    map((event) => ({ selfRef: refs.self[event.payload.self], event })),
    filter((e) => Boolean(e.selfRef)),
    map((e) => ({ event: e.event, status: Status.toSelf(e.selfRef) })),
    distinctUntilChanged((prev, next) => R.equals(prev.status, next.status)),
  );

  statusChanged$.subscribe((e) => {
    bus.fire({
      type: 'sys.net/peer/local/status:changed',
      payload: { self: e.status.id, peer: e.status, event: e.event },
    });
  });

  rx.event<t.PeerLocalStatusRefreshEvent>($, 'sys.net/peer/local/status:refresh')
    .pipe()
    .subscribe((event) => {
      const { self } = event.payload;
      const selfRef = refs.self[self];
      if (selfRef) {
        bus.fire({
          type: 'sys.net/peer/local/status:changed',
          payload: { self, peer: Status.toSelf(selfRef), event },
        });
      }
    });

  /**
   * PURGE
   */
  rx.payload<t.PeerLocalPurgeReqEvent>($, 'sys.net/peer/local/purge:req')
    .pipe()
    .subscribe((e) => {
      const tx = e.tx || slug();
      const self = refs.self[e.self];
      const select = typeof e.select === 'object' ? e.select : { closedConnections: true };

      let changed = false;
      const purged: t.PeerLocalPurged = {
        closedConnections: { data: 0, video: 0, screen: 0 },
      };

      const fire = (payload?: Partial<t.PeerLocalPurgeRes>) => {
        bus.fire({
          type: 'sys.net/peer/local/purge:res',
          payload: { self: e.self, tx, changed, purged, ...payload },
        });
      };
      const fireError = (message: string) => fire({ error: { message } });

      if (!self) {
        const message = `The local PeerNetwork '${e.self}' does not exist`;
        return fireError(message);
      }

      if (select.closedConnections) {
        const closed = self.connections.filter((item) => !Status.toConnection(item).isOpen);
        self.connections = self.connections.filter(
          ({ peer: id }) => !closed.some((c) => c.peer === id),
        );
        closed.forEach((item) => {
          changed = true;
          if (item.kind === 'data') purged.closedConnections.data++;
          if (item.kind === 'media/video') purged.closedConnections.video++;
          if (item.kind === 'media/screen') purged.closedConnections.screen++;
        });
      }

      fire();
    });

  /**
   * CONNECT: Outgoing
   */
  rx.payload<t.PeerConnectReqEvent>($, 'sys.net/peer/conn/connect:req')
    .pipe(filter((e) => e.direction === 'outgoing'))
    .subscribe(async (e) => {
      const { remote } = e;
      const self = refs.self[e.self];
      const tx = e.tx || slug();
      const module = { name: WebRuntime.module.name, version: WebRuntime.module.version };
      const parent = e.parent;

      const fire = (payload?: Partial<t.PeerNetworkConnectRes>) => {
        const existing = Boolean(payload?.existing);
        bus.fire({
          type: 'sys.net/peer/conn/connect:res',
          payload: {
            kind: e.kind,
            self: e.self,
            tx,
            remote,
            direction: 'outgoing',
            existing,
            ...payload,
          },
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

      /**
       * START a data connection.
       */
      if (e.kind === 'data') {
        const metadata: t.PeerConnectionMetadataData = { kind: e.kind, module, parent };
        const reliable = e.isReliable;
        const errorMonitor = PeerJSError(self.peer);
        const dataConnection = self.peer.connect(remote, { reliable, metadata });
        refs.connection(self).add('data', 'outgoing', dataConnection);

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

      /**
       * START a media (video) call.
       */
      if (e.kind === 'media/video' || e.kind === 'media/screen') {
        const { constraints } = e;

        // Retrieve the media stream.
        const res = await events.media(self.id).request({ kind: e.kind, constraints });
        const localStream = res.media;
        if (res.error || !localStream) {
          const err = res.error?.message || `Failed to retrieve a local media stream (${self.id}).`;
          return fireError(err);
        }

        // Start the network/peer connection.
        const metadata: t.PeerConnectionMetadataMedia = {
          kind: e.kind,
          constraints,
          module,
          parent,
        };
        const mediaConnection = self.peer.call(remote, localStream, { metadata });
        const connRef = refs.connection(self).add(e.kind, 'outgoing', mediaConnection);
        connRef.localStream = localStream;

        // Manage timeout.
        const msecs = defaultValue(e.timeout, 10 * 1000);
        const timeout = time.delay(msecs, () => {
          refs.connection(self).remove(mediaConnection);
          const err = `Failed to connect [${e.kind}] to peer '${remote}'. The connection attempt timed out.`;
          fireError(err);
        });

        const completeMediaConnection = () => {
          timeout.cancel();
          completeConnection(e.kind, 'outgoing', self, mediaConnection, tx);
        };

        if (e.kind === 'media/video') {
          mediaConnection.on('stream', (remoteStream) => {
            if (timeout.isCancelled) return;
            connRef.remoteStream = remoteStream;
            completeMediaConnection();
          });
        }

        if (e.kind === 'media/screen') {
          // NB: Complete immediately without waiting for return stream.
          //     Screen shares are always one-way (out) so there will be no incoming stream.
          const completeUponOpen = () => {
            if (!mediaConnection.open) return time.delay(50, completeUponOpen);
            return completeMediaConnection();
          };
          completeUponOpen();
        }

        // Listen for external ending of the stream and clean up accordingly.
        StreamUtil.onEnded(localStream, () => {
          events.connection(self.id, remote).close(connRef.id);
        });
      }
    });

  /**
   * DISCONNECT from a remote peer.
   */
  rx.payload<t.PeerDisconnectReqEvent>($, 'sys.net/peer/conn/disconnect:req')
    .pipe()
    .subscribe(async (e) => {
      const selfRef = refs.self[e.self];
      const tx = e.tx || slug();

      const fire = (payload?: Partial<t.PeerNetworkDisconnectRes>) => {
        const connection = e.connection;
        bus.fire({
          type: 'sys.net/peer/conn/disconnect:res',
          payload: { self: e.self, tx, connection, ...payload },
        });
      };
      const fireError = (message: string) => fire({ error: { message } });

      if (!selfRef) {
        const message = `The local PeerNetwork '${e.self}' does not exist`;
        return fireError(message);
      }

      const connRef = selfRef.connections.find((item) => item.id === e.connection);
      if (!connRef) {
        const message = `The connection to close '${e.connection}' does not exist`;
        return fireError(message);
      }

      // Ensure all child connections are closed.
      const children = selfRef.connections.filter(({ parent }) => parent === e.connection);
      await Promise.all(
        children.map((child) => {
          const { self, remote } = child.peer;
          return events.connection(self, remote.id).close(child.id);
        }),
      );

      // Close the connection.
      if (connRef.conn.open) connRef.conn.close();
      fire({});
    });

  /**
   * DATA:OUT: Send
   */
  rx.payload<t.PeerDataOutEvent>($, 'sys.net/peer/data/out')
    .pipe()
    .subscribe((e) => {
      const target = e.target === undefined ? [] : asArray(e.target);
      if (target.length === 0) target.push(...refs.connection(e.self).ids);
      refs
        .connection(e.self)
        .data.filter((conn) => (!e.target ? true : target.includes(conn.peer)))
        .forEach((conn) => conn.send({ ...e, target }));
    });

  /**
   * API
   */
  return {
    dispose$: events.dispose$,
    dispose,
  };
}
