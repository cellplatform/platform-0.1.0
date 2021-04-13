import { firstValueFrom, Subject } from 'rxjs';
import { take, filter, takeUntil, map } from 'rxjs/operators';
import { cuid, rx, t, slug } from './common';
import { isEvent } from './util';

/**
 * Filter on Peer/Network/Connection events
 */
export function isPeerEvent(e: t.Event) {
  const prefixes = ['sys.net/peer/local/', 'sys.net/peer/connection/', 'Peer:Data/'];
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
    bus.fire({ type: 'sys.net/peer/local/init:req', payload: { self, signal } });
    return res;
  };

  /**
   * CREATED
   */
  const created = (self: t.PeerId) => {
    const $ = rx
      .payload<t.PeerLocalInitResEvent>(event$, 'sys.net/peer/local/init:res')
      .pipe(filter((e) => e.self === self));
    return { self, $ };
  };

  /**
   * STATUS
   */
  const status = (self: t.PeerId) => {
    const request$ = rx
      .payload<t.PeerLocalStatusRequestEvent>(event$, 'sys.net/peer/local/status:req')
      .pipe(filter((e) => e.self === self));
    const response$ = rx
      .payload<t.PeerLocalStatusResponseEvent>(event$, 'sys.net/peer/local/status:res')
      .pipe(filter((e) => e.self === self));
    const changed$ = rx
      .payload<t.PeerLocalStatusChangedEvent>(event$, 'sys.net/peer/local/status:changed')
      .pipe(filter((e) => e.self === self));

    const get = () => {
      const tx = slug();
      const res = firstValueFrom(response$.pipe(filter((e) => e.tx === tx)));
      bus.fire({ type: 'sys.net/peer/local/status:req', payload: { self, tx } });
      return res;
    };

    const refresh = () => {
      bus.fire({ type: 'sys.net/peer/local/status:refresh', payload: { self } });
    };

    return { self, get, refresh, request$, response$, changed$ };
  };

  /**
   * PURGE
   */
  const purge = (self: t.PeerId) => {
    const purge$ = rx
      .payload<t.PeerLocalPurgeReqEvent>(event$, 'sys.net/peer/local/purge:req')
      .pipe(filter((e) => e.self === self));
    const purged$ = rx
      .payload<t.PeerLocalPurgeResEvent>(event$, 'sys.net/peer/local/purge:res')
      .pipe(filter((e) => e.self === self));

    const fire = (select?: t.PeerLocalPurgeReq['select']) => {
      const tx = slug();
      const res = firstValueFrom(purged$.pipe(filter((e) => e.tx === tx)));
      bus.fire({ type: 'sys.net/peer/local/purge:req', payload: { self, tx, select } });
      return res;
    };

    return { self, purge$, purged$, fire };
  };

  /**
   * LOCAL: Media
   */
  const media = (self: t.PeerId) => {
    const request$ = rx
      .payload<t.PeerLocalMediaReqEvent>(event$, 'sys.net/peer/local/media:req')
      .pipe(filter((e) => e.self === self));
    const response$ = rx
      .payload<t.PeerLocalMediaResEvent>(event$, 'sys.net/peer/local/media:res')
      .pipe(filter((e) => e.self === self));

    type Req = t.PeerLocalMediaReq;
    type C = Req['constraints'];
    type O = { constraints?: C; tx?: string };

    const video = async (options?: O) => request({ kind: 'media/video', ...options });
    const screen = async (options?: O) => request({ kind: 'media/screen', ...options });
    const request = async (args: {
      kind: t.PeerConnectionKindMedia;
      constraints?: C;
      tx?: string;
    }) => {
      const { kind, constraints } = args;
      const tx = args.tx || slug();
      const res = firstValueFrom(response$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'sys.net/peer/local/media:req',
        payload: { self, tx, kind, constraints },
      });
      return res;
    };

    const respond = (args: {
      tx: string;
      kind: t.PeerConnectionKindMedia;
      media?: MediaStream;
      error?: t.PeerError;
    }) => {
      const { tx, kind, media, error } = args;
      bus.fire({
        type: 'sys.net/peer/local/media:res',
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
      .payload<t.PeerConnectResEvent>(event$, 'sys.net/peer/connection/connect:res')
      .pipe(filter((e) => e.self === self && e.remote === remote));

    const disconnected$ = rx
      .payload<t.PeerDisconnectResEvent>(event$, 'sys.net/peer/connection/disconnect:res')
      .pipe(filter((e) => e.self === self));

    const open = {
      data(options: { isReliable?: boolean } = {}) {
        const { isReliable } = options;
        const tx = slug();
        const res = firstValueFrom(connected$.pipe(filter((e) => e.tx === tx)));
        bus.fire({
          type: 'sys.net/peer/connection/connect:req',
          payload: { self, tx, remote, kind: 'data', isReliable, direction: 'outgoing' },
        });
        return res;
      },

      video: (constraints?: t.PeerMediaConstraints) => open.media('media/video', { constraints }),
      screen: (constraints?: t.PeerMediaConstraints) => open.media('media/screen', { constraints }),
      media(
        kind: t.PeerNetworkConnectMediaReq['kind'],
        options: { constraints?: t.PeerMediaConstraints } = {},
      ) {
        const { constraints } = options;
        const tx = slug();
        const res = firstValueFrom(connected$.pipe(filter((e) => e.tx === tx)));
        bus.fire({
          type: 'sys.net/peer/connection/connect:req',
          payload: { self, tx, remote, kind, constraints, direction: 'outgoing' },
        });
        return res;
      },
    };

    const close = (id: t.PeerConnectionId) => {
      const tx = slug();
      const res = firstValueFrom(disconnected$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'sys.net/peer/connection/disconnect:req',
        payload: { self, tx, remote, connection: id },
      });
      return res;
    };

    return { self, connected$, disconnected$, open, close };
  };

  const connections = (self: t.PeerId) => {
    const connectResponse$ = rx
      .payload<t.PeerConnectResEvent>(event$, 'sys.net/peer/connection/connect:res')
      .pipe(
        filter((e) => e.self === self),
        filter((e) => !e.existing),
      );

    const disconnectResponse$ = rx
      .payload<t.PeerDisconnectResEvent>(event$, 'sys.net/peer/connection/disconnect:res')
      .pipe(filter((e) => e.self === self));

    const closed$ = rx
      .payload<t.PeerConnectionClosedEvent>(event$, 'sys.net/peer/connection/closed')
      .pipe(filter((e) => e.self === self));

    return { self, connectResponse$, disconnectResponse$, closed$ };
  };

  const data = (self: t.PeerId) => {
    const out$ = rx
      .payload<t.PeerDataOutEvent>(event$, 'sys.net/peer/data/out')
      .pipe(filter((e) => e.self === self));

    const in$ = rx
      .payload<t.PeerDataInEvent>(event$, 'sys.net/peer/data/in')
      .pipe(filter((e) => e.self === self));

    const send = (data: t.JsonMap, target?: t.PeerId | t.PeerId[]) => {
      bus.fire({
        type: 'sys.net/peer/data/out',
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
