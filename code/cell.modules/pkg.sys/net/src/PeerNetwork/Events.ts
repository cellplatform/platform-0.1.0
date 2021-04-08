import { firstValueFrom, Subject } from 'rxjs';
import { take, filter, takeUntil, map } from 'rxjs/operators';
import { cuid, rx, t, slug } from './common';
import { isEvent } from './util';

/**
 * Filter on Peer/Network/Connection events
 */
export function isPeerEvent(e: t.Event) {
  const prefixes = ['Peer:Local/', 'Peer:Connection/', 'Peer:Data/'];
  return prefixes.some((prefix) => e.type.startsWith(prefix));
}

/**
 * Helpers for working with a [PeerNetwork].
 */
export function Events(args: { bus: t.EventBus<any> }) {
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = args.bus.type<t.PeerEvent>();

  const event$ = bus.event$.pipe(
    takeUntil(dispose$),
    filter(isPeerEvent),
    map((e) => e as t.PeerEvent),
  );

  /**
   * CREATE
   */
  const create = (signal: string, id?: t.PeerId) => {
    const self = id || cuid();
    const res = firstValueFrom(created(self).$);
    bus.fire({ type: 'Peer:Local/init:req', payload: { self, signal } });
    return res;
  };

  /**
   * CREATED
   */
  const created = (self: t.PeerId) => {
    const $ = rx
      .payload<t.PeerLocalInitResEvent>(event$, 'Peer:Local/init:res')
      .pipe(filter((e) => e.self === self));
    return { self, $ };
  };

  /**
   * STATUS
   */
  const status = (self: t.PeerId) => {
    const request$ = rx
      .payload<t.PeerLocalStatusRequestEvent>(event$, 'Peer:Local/status:req')
      .pipe(filter((e) => e.self === self));
    const response$ = rx
      .payload<t.PeerLocalStatusResponseEvent>(event$, 'Peer:Local/status:res')
      .pipe(filter((e) => e.self === self));
    const changed$ = rx
      .payload<t.PeerLocalStatusChangedEvent>(event$, 'Peer:Local/status:changed')
      .pipe(filter((e) => e.self === self));

    const get = () => {
      const tx = slug();
      const res = firstValueFrom(response$.pipe(filter((e) => e.tx === tx)));
      bus.fire({ type: 'Peer:Local/status:req', payload: { self, tx } });
      return res;
    };

    const refresh = () => {
      bus.fire({ type: 'Peer:Local/status:refresh', payload: { self } });
    };

    return { self, get, refresh, request$, response$, changed$ };
  };

  /**
   * PURGE
   */
  const purge = (self: t.PeerId) => {
    const purge$ = rx
      .payload<t.PeerLocalPurgeReqEvent>(event$, 'Peer:Local/purge:req')
      .pipe(filter((e) => e.self === self));
    const purged$ = rx
      .payload<t.PeerLocalPurgeResEvent>(event$, 'Peer:Local/purge:res')
      .pipe(filter((e) => e.self === self));

    const fire = (select?: t.PeerLocalPurgeReq['select']) => {
      const tx = slug();
      const res = firstValueFrom(purged$.pipe(filter((e) => e.tx === tx)));
      bus.fire({ type: 'Peer:Local/purge:req', payload: { self, tx, select } });
      return res;
    };

    return { self, purge$, purged$, fire };
  };

  /**
   * LOCAL: Media
   */
  const media = (self: t.PeerId) => {
    const request$ = rx
      .payload<t.PeerLocalMediaReqEvent>(event$, 'Peer:Local/media:req')
      .pipe(filter((e) => e.self === self));
    const response$ = rx
      .payload<t.PeerLocalMediaResEvent>(event$, 'Peer:Local/media:res')
      .pipe(filter((e) => e.self === self));

    type Req = t.PeerLocalMediaReq;
    type C = Req['constraints'];
    type O = { constraints?: C; tx?: string };

    const video = async (options?: O) => request({ kind: 'video', ...options });
    const screen = async (options?: O) => request({ kind: 'screen', ...options });
    const request = async (args: { kind: t.PeerMediaKind; constraints?: C; tx?: string }) => {
      const { kind, constraints } = args;
      const tx = args.tx || slug();
      const res = firstValueFrom(response$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'Peer:Local/media:req',
        payload: { self, tx, kind, constraints },
      });
      return res;
    };

    const respond = (args: {
      tx: string;
      kind: t.PeerMediaKind;
      media?: MediaStream;
      error?: t.PeerError;
    }) => {
      const { tx, kind, media, error } = args;
      bus.fire({
        type: 'Peer:Local/media:res',
        payload: { self, tx, kind, media, error },
      });
    };

    return { self, request$, response$, request, video, screen, respond };
  };

  /**
   * CONNECT (Outgoing)
   */
  const connection = (self: t.PeerId, remote: t.PeerId) => {
    const connected$ = rx
      .payload<t.PeerConnectResEvent>(event$, 'Peer:Connection/connect:res')
      .pipe(filter((e) => e.self === self && e.remote === remote));

    const disconnected$ = rx
      .payload<t.PeerDisconnectResEvent>(event$, 'Peer:Connection/disconnect:res')
      .pipe(filter((e) => e.self === self));

    const open = {
      data(options: { isReliable?: boolean } = {}) {
        const { isReliable } = options;
        const tx = slug();
        const res = firstValueFrom(connected$.pipe(filter((e) => e.tx === tx)));
        bus.fire({
          type: 'Peer:Connection/connect:req',
          payload: { self, tx, remote, kind: 'data', isReliable, direction: 'outgoing' },
        });
        return res;
      },

      video: (constraints?: t.PeerMediaConstraints) => open.media('video', { constraints }),
      screen: (constraints?: t.PeerMediaConstraints) => open.media('screen', { constraints }),
      media(
        kind: t.PeerNetworkConnectMediaReq['kind'],
        options: { constraints?: t.PeerMediaConstraints } = {},
      ) {
        const { constraints } = options;
        const tx = slug();
        const res = firstValueFrom(connected$.pipe(filter((e) => e.tx === tx)));
        bus.fire({
          type: 'Peer:Connection/connect:req',
          payload: { self, tx, remote, kind, constraints, direction: 'outgoing' },
        });
        return res;
      },
    };

    const close = (id: t.PeerConnectionId) => {
      const tx = slug();
      const res = firstValueFrom(disconnected$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'Peer:Connection/disconnect:req',
        payload: { self, tx, remote, connection: id },
      });
      return res;
    };

    return { self, connected$, disconnected$, open, close };
  };

  const connections = (self: t.PeerId) => {
    const connectResponse$ = rx
      .payload<t.PeerConnectResEvent>(event$, 'Peer:Connection/connect:res')
      .pipe(
        filter((e) => e.self === self),
        filter((e) => !e.existing),
      );

    const disconnectResponse$ = rx
      .payload<t.PeerDisconnectResEvent>(event$, 'Peer:Connection/disconnect:res')
      .pipe(filter((e) => e.self === self));

    const closed$ = rx
      .payload<t.PeerConnectionClosedEvent>(event$, 'Peer:Connection/closed')
      .pipe(filter((e) => e.self === self));

    return { self, connectResponse$, disconnectResponse$, closed$ };
  };

  const data = (self: t.PeerId) => {
    const out$ = rx
      .payload<t.PeerDataOutEvent>(event$, 'Peer:Data/out')
      .pipe(filter((e) => e.self === self));

    const in$ = rx
      .payload<t.PeerDataInEvent>(event$, 'Peer:Data/in')
      .pipe(filter((e) => e.self === self));

    const send = (data: t.JsonMap, target?: t.PeerId | t.PeerId[]) => {
      bus.fire({
        type: 'Peer:Data/out',
        payload: { self, data, target },
      });
    };

    return {
      self,
      in$,
      out$,
      send,
      bus<E extends t.Event>(options: { target?: () => t.PeerDataOut['target'] } = {}) {
        const bus$ = new Subject<t.Event>();
        let current: undefined | t.Event;

        // Ferry events fired into the bus out to target connections.
        bus$
          .pipe(
            takeUntil(dispose$),
            filter((e) => e !== current), // NB: Prevent circular event loop.
          )
          .subscribe((e) => {
            // NB: undefined target sends to all connections.
            const target = options.target ? options.target() : undefined;
            send(e, target);
          });

        // Listen for incoming events from the network and pass into the bus.
        in$.pipe(filter((e) => isEvent(e.data))).subscribe((e) => {
          current = e.data as t.Event;
          bus$.next(current);
          current = undefined;
        });

        return rx.bus<E>(bus$);
      },
    };
  };

  return {
    dispose,
    dispose$: dispose$.pipe(take(1)),

    $: event$,
    create,
    created,
    status,
    purge,
    media,
    connection,
    connections,
    data,
  };
}
