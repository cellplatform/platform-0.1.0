import { firstValueFrom, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { cuid, rx, t } from '../../common';

/**
 * Helpers for working with a [PeerNetwork].
 */
export function PeerNetworkEvents(args: { bus: t.EventBus<any> }) {
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = args.bus.type<t.PeerNetworkEvent>();
  const event$ = bus.event$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('PeerNetwork/')),
  );

  /**
   * CREATE
   */
  const create = (signal: string, options: { id?: string } = {}) => {
    const id = options.id || cuid();
    const res = firstValueFrom(created(id).$);
    bus.fire({ type: 'PeerNetwork/create:req', payload: { ref: id, signal } });
    return res;
  };

  /**
   * CREATED
   */
  const created = (ref: string) => {
    const $ = rx
      .payload<t.PeerNetworkCreatResEvent>(event$, 'PeerNetwork/create:res')
      .pipe(filter((e) => e.ref === ref));
    return { ref, $ };
  };

  /**
   * STATUS
   */
  const status = (ref: string) => {
    const request$ = rx
      .payload<t.PeerNetworkStatusRequestEvent>(event$, 'PeerNetwork/status:req')
      .pipe(filter((e) => e.ref === ref));
    const response$ = rx
      .payload<t.PeerNetworkStatusResponseEvent>(event$, 'PeerNetwork/status:res')
      .pipe(filter((e) => e.ref === ref));

    const get = () => {
      const res = firstValueFrom(response$);
      bus.fire({ type: 'PeerNetwork/status:req', payload: { ref } });
      return res;
    };

    return { ref, get, request$, response$ };
  };

  /**
   * PURGE
   */
  const purge = (ref: string) => {
    const purge$ = rx
      .payload<t.PeerNetworkPurgeReqEvent>(event$, 'PeerNetwork/purge:req')
      .pipe(filter((e) => e.ref === ref));
    const purged$ = rx
      .payload<t.PeerNetworkPurgeResEvent>(event$, 'PeerNetwork/purge:res')
      .pipe(filter((e) => e.ref === ref));

    const fire = (select?: t.PeerNetworkPurgeReq['select']) => {
      const res = firstValueFrom(purged$);
      bus.fire({ type: 'PeerNetwork/purge:req', payload: { ref, select } });
      return res;
    };

    return { purge$, purged$, fire };
  };

  /**
   * CONNECT
   */
  const connection = (ref: string, remote: string) => {
    const connected$ = rx
      .payload<t.PeerNetworkConnectResEvent>(event$, 'PeerNetwork/connect:res')
      .pipe(filter((e) => e.ref === ref && e.remote === remote));

    const disconnected$ = rx
      .payload<t.PeerNetworkDisconnectResEvent>(event$, 'PeerNetwork/disconnect:res')
      .pipe(filter((e) => e.ref === ref && e.remote === remote));

    const open = {
      data(options: { reliable?: boolean } = {}) {
        const { reliable } = options;
        const res = firstValueFrom(connected$);
        bus.fire({
          type: 'PeerNetwork/connect:req',
          payload: { ref, remote: remote, kind: 'data', reliable },
        });
        return res;
      },
      media() {
        const res = firstValueFrom(connected$);
        bus.fire({
          type: 'PeerNetwork/connect:req',
          payload: { ref, remote: remote, kind: 'media' },
        });
        return res;
      },
    };

    const close = () => {
      const res = firstValueFrom(disconnected$);
      bus.fire({ type: 'PeerNetwork/disconnect:req', payload: { ref, remote } });
      return res;
    };

    return { ref, connected$, disconnected$, open, close };
  };

  const connections = (ref: string) => {
    const opened$ = rx
      .payload<t.PeerNetworkConnectResEvent>(event$, 'PeerNetwork/connect:res')
      .pipe(filter((e) => e.ref === ref));

    const closed$ = rx
      .payload<t.PeerNetworkConnectionClosedEvent>(event$, 'PeerNetwork/connection:closed')
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
