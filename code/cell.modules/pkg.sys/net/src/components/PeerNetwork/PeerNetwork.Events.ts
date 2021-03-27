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
    const local = options.id || cuid();
    const res = firstValueFrom(created(local).$);
    bus.fire({ type: 'PeerNetwork/create', payload: { local, signal } });
    return res;
  };

  /**
   * CREATED
   */
  const created = (local: string) => {
    const $ = rx
      .payload<t.PeerNetworkCreatedEvent>(event$, 'PeerNetwork/created')
      .pipe(filter((e) => e.local === local));
    return { local, $ };
  };

  /**
   * STATUS
   */
  const status = (local: string) => {
    const request$ = rx
      .payload<t.PeerNetworkStatusRequestEvent>(event$, 'PeerNetwork/status:req')
      .pipe(filter((e) => e.local === local));
    const response$ = rx
      .payload<t.PeerNetworkStatusResponseEvent>(event$, 'PeerNetwork/status:res')
      .pipe(filter((e) => e.local === local));

    const get = () => {
      const res = firstValueFrom(response$);
      bus.fire({ type: 'PeerNetwork/status:req', payload: { local } });
      return res;
    };

    return { id: local, get, request$, response$ };
  };

  /**
   * CONNECT
   */
  const connect = (local: string, remote: string) => {
    return {
      data(options: { reliable?: boolean } = {}) {
        const { reliable } = options;
        const res = firstValueFrom(connected(local, remote).$);
        bus.fire({
          type: 'PeerNetwork/connect',
          payload: { local, remote: remote, kind: 'data', reliable },
        });
        return res;
      },
      media() {
        const res = firstValueFrom(connected(local, remote).$);
        bus.fire({
          type: 'PeerNetwork/connect',
          payload: { local: local, remote: remote, kind: 'media' },
        });
        return res;
      },
    };
  };

  const connected = (id: string, remote: string) => {
    const $ = rx
      .payload<t.PeerNetworkConnectedEvent>(event$, 'PeerNetwork/connected')
      .pipe(filter((e) => e.local === id && e.remote === remote));
    return { id, $ };
  };

  return {
    dispose,
    dispose$: dispose$.asObservable(),

    $: event$,
    create,
    created,
    status,
    connect,
  };
}
