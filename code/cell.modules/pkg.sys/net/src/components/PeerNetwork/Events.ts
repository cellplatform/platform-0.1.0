import { firstValueFrom, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { cuid, rx, t } from '../../common';

/**
 * Filter on Peer/Network/Connection events
 */
export function isPeerEvent(e: t.Event) {
  return e.type.startsWith('Peer/');
}

/**
 * Helpers for working with a [PeerNetwork].
 */
export function PeerNetworkEvents(args: { bus: t.EventBus<any> }) {
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = args.bus.type<t.PeerEvent>();
  const event$ = bus.event$.pipe(takeUntil(dispose$), filter(isPeerEvent));

  /**
   * CREATE
   */
  const create = (signal: string, options: { id?: string } = {}) => {
    const id = options.id || cuid();
    const res = firstValueFrom(created(id).$);
    bus.fire({ type: 'Peer/Network/init:req', payload: { ref: id, signal } });
    return res;
  };

  /**
   * CREATED
   */
  const created = (ref: string) => {
    const $ = rx
      .payload<t.PeerNetworkInitResEvent>(event$, 'Peer/Network/init:res')
      .pipe(filter((e) => e.ref === ref));
    return { ref, $ };
  };

  /**
   * STATUS
   */
  const status = (ref: string) => {
    const request$ = rx
      .payload<t.PeerNetworkStatusRequestEvent>(event$, 'Peer/Network/status:req')
      .pipe(filter((e) => e.ref === ref));
    const response$ = rx
      .payload<t.PeerNetworkStatusResponseEvent>(event$, 'Peer/Network/status:res')
      .pipe(filter((e) => e.ref === ref));

    const get = () => {
      const res = firstValueFrom(response$);
      bus.fire({ type: 'Peer/Network/status:req', payload: { ref } });
      return res;
    };

    return { ref, get, request$, response$ };
  };

  /**
   * PURGE
   */
  const purge = (ref: string) => {
    const purge$ = rx
      .payload<t.PeerNetworkPurgeReqEvent>(event$, 'Peer/Network/purge:req')
      .pipe(filter((e) => e.ref === ref));
    const purged$ = rx
      .payload<t.PeerNetworkPurgeResEvent>(event$, 'Peer/Network/purge:res')
      .pipe(filter((e) => e.ref === ref));

    const fire = (select?: t.PeerNetworkPurgeReq['select']) => {
      const res = firstValueFrom(purged$);
      bus.fire({ type: 'Peer/Network/purge:req', payload: { ref, select } });
      return res;
    };

    return { purge$, purged$, fire };
  };

  /**
   * CONNECT (Outgoing)
   */
  const connection = (ref: string, remote: string) => {
    const connected$ = rx
      .payload<t.PeerConnectResEvent>(event$, 'Peer/connect:res')
      .pipe(filter((e) => e.ref === ref && e.remote === remote));

    const disconnected$ = rx
      .payload<t.PeerDisconnectResEvent>(event$, 'Peer/disconnect:res')
      .pipe(filter((e) => e.ref === ref && e.remote === remote));

    const open = {
      data(options: { reliable?: boolean; metadata?: t.JsonMap } = {}) {
        const { reliable, metadata } = options;
        const res = firstValueFrom(connected$);
        bus.fire({
          type: 'Peer/connect:req',
          payload: { ref, remote, kind: 'data', reliable, metadata, direction: 'outgoing' },
        });
        return res;
      },
      media(options: { metadata?: t.JsonMap } = {}) {
        const { metadata } = options;
        const res = firstValueFrom(connected$);
        bus.fire({
          type: 'Peer/connect:req',
          payload: { ref, remote, kind: 'media', metadata, direction: 'outgoing' },
        });
        return res;
      },
    };

    const close = () => {
      const res = firstValueFrom(disconnected$);
      bus.fire({ type: 'Peer/disconnect:req', payload: { ref, remote } });
      return res;
    };

    return { ref, connected$, disconnected$, open, close };
  };

  const connections = (ref: string) => {
    const opened$ = rx
      .payload<t.PeerConnectResEvent>(event$, 'Peer/connect:res')
      .pipe(filter((e) => e.ref === ref));

    const closed$ = rx
      .payload<t.PeerConnectionClosedEvent>(event$, 'Peer/connection:closed')
      .pipe(filter((e) => e.ref === ref));

    return { ref, opened$, closed$ };
  };

  return {
    dispose,
    dispose$: dispose$.asObservable(),

    $: event$,
    create,
    created,
    status,
    purge,
    connection,
    connections,
  };
}
