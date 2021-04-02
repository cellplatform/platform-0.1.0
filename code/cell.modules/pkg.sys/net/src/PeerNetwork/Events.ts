import { firstValueFrom, Subject } from 'rxjs';
import { take, filter, takeUntil } from 'rxjs/operators';
import { cuid, rx, t } from '../common';
import { isEvent } from './util';

/**
 * Filter on Peer/Network/Connection events
 */
export function isPeerEvent(e: t.Event) {
  const prefixes = ['Peer:Network/', 'Peer:Connection/', 'Peer:Data/'];
  return prefixes.some((prefix) => e.type.startsWith(prefix));
}

/**
 * Helpers for working with a [PeerNetwork].
 */
export function Events(args: { bus: t.EventBus<any> }) {
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = args.bus.type<t.PeerEvent>();
  const event$ = bus.event$.pipe(takeUntil(dispose$), filter(isPeerEvent));

  /**
   * CREATE
   */
  const create = (signal: string, id?: t.PeerId) => {
    const self = id || cuid();
    const res = firstValueFrom(created(self).$);
    bus.fire({ type: 'Peer:Network/init:req', payload: { self, signal } });
    return res;
  };

  /**
   * CREATED
   */
  const created = (self: t.PeerId) => {
    const $ = rx
      .payload<t.PeerNetworkInitResEvent>(event$, 'Peer:Network/init:res')
      .pipe(filter((e) => e.self === self));
    return { self, $ };
  };

  /**
   * STATUS
   */
  const status = (self: t.PeerId) => {
    const request$ = rx
      .payload<t.PeerNetworkStatusRequestEvent>(event$, 'Peer:Network/status:req')
      .pipe(filter((e) => e.self === self));
    const response$ = rx
      .payload<t.PeerNetworkStatusResponseEvent>(event$, 'Peer:Network/status:res')
      .pipe(filter((e) => e.self === self));

    const get = () => {
      const res = firstValueFrom(response$);
      bus.fire({ type: 'Peer:Network/status:req', payload: { self: self } });
      return res;
    };

    return { self, get, request$, response$ };
  };

  /**
   * PURGE
   */
  const purge = (self: t.PeerId) => {
    const purge$ = rx
      .payload<t.PeerNetworkPurgeReqEvent>(event$, 'Peer:Network/purge:req')
      .pipe(filter((e) => e.self === self));
    const purged$ = rx
      .payload<t.PeerNetworkPurgeResEvent>(event$, 'Peer:Network/purge:res')
      .pipe(filter((e) => e.self === self));

    const fire = (select?: t.PeerNetworkPurgeReq['select']) => {
      const res = firstValueFrom(purged$);
      bus.fire({ type: 'Peer:Network/purge:req', payload: { self: self, select } });
      return res;
    };

    return { purge$, purged$, fire };
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
      .pipe(filter((e) => e.self === self && e.remote === remote));

    const open = {
      data(options: { reliable?: boolean; metadata?: t.JsonMap } = {}) {
        const { reliable, metadata } = options;
        const res = firstValueFrom(connected$);
        bus.fire({
          type: 'Peer:Connection/connect:req',
          payload: { self: self, remote, kind: 'data', reliable, metadata, direction: 'outgoing' },
        });
        return res;
      },
      media(options: { metadata?: t.JsonMap } = {}) {
        const { metadata } = options;
        const res = firstValueFrom(connected$);
        bus.fire({
          type: 'Peer:Connection/connect:req',
          payload: { self: self, remote, kind: 'media', metadata, direction: 'outgoing' },
        });
        return res;
      },
    };

    const close = () => {
      const res = firstValueFrom(disconnected$);
      bus.fire({ type: 'Peer:Connection/disconnect:req', payload: { self: self, remote } });
      return res;
    };

    return { self, connected$, disconnected$, open, close };
  };

  const connections = (self: t.PeerId) => {
    const opened$ = rx
      .payload<t.PeerConnectResEvent>(event$, 'Peer:Connection/connect:res')
      .pipe(filter((e) => e.self === self));

    const closed$ = rx
      .payload<t.PeerConnectionClosedEvent>(event$, 'Peer:Connection/closed')
      .pipe(filter((e) => e.self === self));

    return { self, opened$, closed$ };
  };

  const data = (self: t.PeerId) => {
    const send$ = rx
      .payload<t.PeerDataSendEvent>(event$, 'Peer:Data/send')
      .pipe(filter((e) => e.self === self));

    const received$ = rx
      .payload<t.PeerDataReceivedEvent>(event$, 'Peer:Data/received')
      .pipe(filter((e) => e.self === self));

    const send = (data: t.JsonMap, target?: t.PeerId | t.PeerId[]) => {
      bus.fire({
        type: 'Peer:Data/send',
        payload: { self, data, target },
      });
    };

    return {
      self,
      send$,
      received$,
      send,
      bus<E extends t.Event>(options: { target?: () => t.PeerDataSend['target'] } = {}) {
        const bus$ = new Subject<t.Event>();
        let current: undefined | t.Event;

        // Ferry events fired into the bus out to target connections.
        bus$
          .pipe(
            takeUntil(dispose$),
            filter((e) => e !== current), // NB: Prevent circular event loop.
          )
          .subscribe((e) => {
            const target = options.target ? options.target() : undefined;
            send(e, target);
          });

        // Listen for incoming events from the network and pass into the bus.
        received$.pipe(filter((e) => isEvent(e.data))).subscribe((e) => {
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
    connection,
    connections,
    data,
  };
}
