import { firstValueFrom, Subject, of, timeout } from 'rxjs';
import { take, filter, takeUntil, map, catchError } from 'rxjs/operators';
import { cuid, rx, t, slug } from '../common';

import { PeerEventNamespace } from './PeerEvents.ns';

type Milliseconds = number;

/**
 * Helpers for working with the events model for a [PeerNetwork].
 */
export function PeerEvents(eventbus: t.EventBus<any>): t.PeerEvents {
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = rx.busAsType<t.PeerEvent>(eventbus);

  const bus$ = bus.$.pipe(
    takeUntil(dispose$),
    filter(PeerEventNamespace.is.peer.base),
    map((e) => e as t.PeerEvent),
  );

  /**
   * CREATE
   */
  const create = (signal: string, id?: t.PeerId) => {
    const self = id || cuid();
    const res = firstValueFrom(created(self).$);
    bus.fire({
      type: 'sys.net/peer/local/init:req',
      payload: { self, signal },
    });
    return res;
  };

  /**
   * CREATED
   */
  const created = (self: t.PeerId) => {
    const $ = rx
      .payload<t.PeerLocalInitResEvent>(bus$, 'sys.net/peer/local/init:res')
      .pipe(filter((e) => e.self === self));
    return { self, $ };
  };

  /**
   * STATUS
   */
  const Status = (self: t.PeerId) => {
    const req$ = rx
      .payload<t.PeerLocalStatusReqEvent>(bus$, 'sys.net/peer/local/status:req')
      .pipe(filter((e) => e.self === self));
    const res$ = rx
      .payload<t.PeerLocalStatusResEvent>(bus$, 'sys.net/peer/local/status:res')
      .pipe(filter((e) => e.self === self));
    const changed$ = rx
      .payload<t.PeerLocalStatusChangedEvent>(bus$, 'sys.net/peer/local/status:changed')
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
  const Purge = (self: t.PeerId) => {
    const req$ = rx
      .payload<t.PeerLocalPurgeReqEvent>(bus$, 'sys.net/peer/local/purge:req')
      .pipe(filter((e) => e.self === self));
    const res$ = rx
      .payload<t.PeerLocalPurgeResEvent>(bus$, 'sys.net/peer/local/purge:res')
      .pipe(filter((e) => e.self === self));

    const fire = (select?: t.PeerLocalPurgeReq['select']) => {
      const tx = slug();
      const res = firstValueFrom(res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({ type: 'sys.net/peer/local/purge:req', payload: { self, tx, select } });
      return res;
    };

    return { self, req$, res$, fire };
  };

  /**
   * LOCAL: Media
   */
  const Media = (self: t.PeerId) => {
    const req$ = rx
      .payload<t.PeerLocalMediaReqEvent>(bus$, 'sys.net/peer/local/media:req')
      .pipe(filter((e) => e.self === self));
    const res$ = rx
      .payload<t.PeerLocalMediaResEvent>(bus$, 'sys.net/peer/local/media:res')
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
  const Connection = (self: t.PeerId, remote: t.PeerId) => {
    const connected$ = rx
      .payload<t.PeerConnectResEvent>(bus$, 'sys.net/peer/conn/connect:res')
      .pipe(filter((e) => e.self === self && e.remote === remote));

    const disconnected$ = rx
      .payload<t.PeerDisconnectResEvent>(bus$, 'sys.net/peer/conn/disconnect:res')
      .pipe(filter((e) => e.self === self));

    const open = {
      data(options: { isReliable?: boolean; parent?: t.PeerConnectionId } = {}) {
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
        kind: t.PeerConnectMediaReq['kind'],
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

    const close = (connection: t.PeerConnectionId) => {
      const tx = slug();
      const res = firstValueFrom(disconnected$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'sys.net/peer/conn/disconnect:req',
        payload: { self, tx, remote, connection },
      });
      return res;
    };

    return { self, connected$, disconnected$, open, close };
  };

  /**
   * Connections
   */
  const Connections = (self: t.PeerId) => {
    const connect = {
      req$: rx
        .payload<t.PeerConnectReqEvent>(bus$, 'sys.net/peer/conn/connect:req')
        .pipe(filter((e) => e.self === self)),
      res$: rx.payload<t.PeerConnectResEvent>(bus$, 'sys.net/peer/conn/connect:res').pipe(
        filter((e) => e.self === self),
        filter((e) => !e.existing),
      ),
    };

    const disconnect = {
      req$: rx
        .payload<t.PeerDisconnectReqEvent>(bus$, 'sys.net/peer/conn/disconnect:req')
        .pipe(filter((e) => e.self === self)),
      res$: rx
        .payload<t.PeerDisconnectResEvent>(bus$, 'sys.net/peer/conn/disconnect:res')
        .pipe(filter((e) => e.self === self)),
    };

    return { self, connect, disconnect };
  };

  /**
   * Data stream
   */
  const Data = (self: t.PeerId) => {
    const out = {
      req$: rx
        .payload<t.PeerDataOutReqEvent>(bus$, 'sys.net/peer/data/out:req')
        .pipe(filter((e) => e.self === self)),
      res$: rx
        .payload<t.PeerDataOutResEvent>(bus$, 'sys.net/peer/data/out:res')
        .pipe(filter((e) => e.self === self)),
    };

    const in$ = rx
      .payload<t.PeerDataInEvent>(bus$, 'sys.net/peer/data/in')
      .pipe(filter((e) => e.self === self));

    const send = (data: any, options: { targets?: t.PeerConnectionUriString[] } = {}) => {
      const { targets } = options;
      const tx = slug();
      const res = firstValueFrom(out.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({
        type: 'sys.net/peer/data/out:req',
        payload: { tx, self, data, targets },
      });
      return res;
    };

    return { self, out, in$, send };
  };

  /**
   * Investigate remote peers
   */
  const Remote = {
    exists: {
      req$: rx.payload<t.PeerRemoteExistsReqEvent>(bus$, 'sys.net/peer/remote/exists:req'),
      res$: rx.payload<t.PeerRemoteExistsResEvent>(bus$, 'sys.net/peer/remote/exists:res'),
      async get(args: { self: t.PeerId; remote: t.PeerId; timeout?: Milliseconds }) {
        const { self, remote } = args;
        const tx = slug();
        const msecs = args.timeout ?? 10000;
        const first = firstValueFrom(
          Remote.exists.res$.pipe(
            filter((e) => e.tx === tx),
            timeout(msecs),
            catchError(() => of(`[remote.exists] timed out after ${msecs} msecs`)),
          ),
        );

        bus.fire({
          type: 'sys.net/peer/remote/exists:req',
          payload: { tx, self, remote },
        });

        const res = await first;
        if (typeof res !== 'string') return res;

        const fail: t.PeerRemoteExistsRes = {
          tx,
          self,
          remote,
          exists: false,
          error: res,
        };
        return fail;
      },
    },
  };

  return {
    dispose,
    dispose$: dispose$.pipe(take(1)),

    is: PeerEventNamespace.is,
    $: bus$,

    create,
    created,
    status: Status,
    purge: Purge,
    media: Media,
    connection: Connection,
    connections: Connections,
    data: Data,
    remote: Remote,
  };
}
