import { firstValueFrom, Subject } from 'rxjs';
import { take, filter, takeUntil, map } from 'rxjs/operators';
import { cuid, rx, t, slug } from '../common';

import { EventNamespace as ns } from './Events.ns';
import { PeerBus } from './PeerBus';
export { ns };

/**
 * Helpers for working with a [PeerNetwork].
 */
export function Events(eventbus: t.EventBus<any>) {
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = eventbus as t.EventBus<t.PeerEvent>;

  const event$ = bus.$.pipe(
    takeUntil(dispose$),
    filter(ns.is.peer.base),
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
    const req$ = rx
      .payload<t.PeerLocalStatusRequestEvent>(event$, 'sys.net/peer/local/status:req')
      .pipe(filter((e) => e.self === self));
    const res$ = rx
      .payload<t.PeerLocalStatusResponseEvent>(event$, 'sys.net/peer/local/status:res')
      .pipe(filter((e) => e.self === self));
    const changed$ = rx
      .payload<t.PeerLocalStatusChangedEvent>(event$, 'sys.net/peer/local/status:changed')
      .pipe(filter((e) => e.self === self));

    const get = () => {
      const tx = slug();
      const res = firstValueFrom(res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({ type: 'sys.net/peer/local/status:req', payload: { self, tx } });
      return res;
    };

    const refresh = () => {
      bus.fire({ type: 'sys.net/peer/local/status:refresh', payload: { self } });
    };

    return { self, get, refresh, req$, res$, changed$ };
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
    const req$ = rx
      .payload<t.PeerLocalMediaReqEvent>(event$, 'sys.net/peer/local/media:req')
      .pipe(filter((e) => e.self === self));
    const res$ = rx
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
      const res = firstValueFrom(res$.pipe(filter((e) => e.tx === tx)));
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

    return { self, req$, res$, request, video, screen, respond };
  };

  /**
   * CONNECT (Outgoing)
   */
  const connection = (self: t.PeerId, remote: t.PeerId) => {
    const connected$ = rx
      .payload<t.PeerConnectResEvent>(event$, 'sys.net/peer/conn/connect:res')
      .pipe(filter((e) => e.self === self && e.remote === remote));

    const disconnected$ = rx
      .payload<t.PeerDisconnectResEvent>(event$, 'sys.net/peer/conn/disconnect:res')
      .pipe(filter((e) => e.self === self));

    const open = {
      async data(options: { isReliable?: boolean; parent?: t.PeerConnectionId } = {}) {
        const { isReliable, parent } = options;
        const tx = slug();
        const res = firstValueFrom(connected$.pipe(filter((e) => e.tx === tx)));
        bus.fire({
          type: 'sys.net/peer/conn/connect:req',
          payload: { self, tx, remote, kind: 'data', direction: 'outgoing', isReliable, parent },
        });
        return res;
      },

      media(
        kind: t.PeerNetworkConnectMediaReq['kind'],
        options: { constraints?: t.PeerMediaConstraints; parent?: t.PeerConnectionId } = {},
      ) {
        const { constraints, parent } = options;
        const tx = slug();
        const res = firstValueFrom(connected$.pipe(filter((e) => e.tx === tx)));
        bus.fire({
          type: 'sys.net/peer/conn/connect:req',
          payload: { self, tx, remote, kind, direction: 'outgoing', constraints, parent },
        });
        return res;
      },
    };

    const close = (id: t.PeerConnectionId) => {
      const tx = slug();
      const res = firstValueFrom(disconnected$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'sys.net/peer/conn/disconnect:req',
        payload: { self, tx, remote, connection: id },
      });
      return res;
    };

    return { self, connected$, disconnected$, open, close };
  };

  const connections = (self: t.PeerId) => {
    const connect = {
      req$: rx
        .payload<t.PeerConnectReqEvent>(event$, 'sys.net/peer/conn/connect:req')
        .pipe(filter((e) => e.self === self)),
      res$: rx.payload<t.PeerConnectResEvent>(event$, 'sys.net/peer/conn/connect:res').pipe(
        filter((e) => e.self === self),
        filter((e) => !e.existing),
      ),
    };

    const disconnect = {
      req$: rx
        .payload<t.PeerDisconnectReqEvent>(event$, 'sys.net/peer/conn/disconnect:req')
        .pipe(filter((e) => e.self === self)),
      res$: rx
        .payload<t.PeerDisconnectResEvent>(event$, 'sys.net/peer/conn/disconnect:res')
        .pipe(filter((e) => e.self === self)),
    };

    return { self, connect, disconnect };
  };

  const data = (self: t.PeerId) => {
    const out = {
      req$: rx
        .payload<t.PeerDataOutReqEvent>(event$, 'sys.net/peer/data/out:req')
        .pipe(filter((e) => e.self === self)),
      res$: rx
        .payload<t.PeerDataOutResEvent>(event$, 'sys.net/peer/data/out:res')
        .pipe(filter((e) => e.self === self)),
    };

    const in$ = rx
      .payload<t.PeerDataInEvent>(event$, 'sys.net/peer/data/in')
      .pipe(filter((e) => e.self === self));

    const send = (data: any, options: { filter?: t.PeerFilter } = {}) => {
      const tx = slug();
      const res = firstValueFrom(out.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'sys.net/peer/data/out:req',
        payload: { tx, self, data, filter: options.filter },
      });
      return res;
    };

    return {
      self,
      out,
      in$,
      send,
      netbus<E extends t.Event>() {
        return PeerBus<E>({ bus, self });
      },
    };
  };

  return {
    dispose,
    dispose$: dispose$.pipe(take(1)),

    ns,
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
