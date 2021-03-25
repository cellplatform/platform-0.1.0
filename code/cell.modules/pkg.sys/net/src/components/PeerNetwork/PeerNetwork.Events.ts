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
    bus.fire({ type: 'PeerNetwork/create', payload: { id, signal } });
    return res;
  };

  /**
   * CREATED
   */
  const created = (id: string) => {
    const $ = rx
      .payload<t.PeerNetworkCreatedEvent>(event$, 'PeerNetwork/created')
      .pipe(filter((e) => e.id === id));
    return { id, $ };
  };

  /**
   * STATUS
   */
  const status = (id: string) => {
    const request$ = rx
      .payload<t.PeerNetworkStatusRequestEvent>(event$, 'PeerNetwork/status:req')
      .pipe(filter((e) => e.id === id));
    const response$ = rx
      .payload<t.PeerNetworkStatusResponseEvent>(event$, 'PeerNetwork/status:res')
      .pipe(filter((e) => e.id === id));

    const get = () => {
      const res = firstValueFrom(response$);
      bus.fire({ type: 'PeerNetwork/status:req', payload: { id } });
      return res;
    };

    return { id, get, request$, response$ };
  };

  /**
   * CONNECT
   */
  const connect = (id: string, target: string) => {
    return {
      data(options: { reliable?: boolean } = {}) {
        const { reliable } = options;
        const res = firstValueFrom(connected(id, target).$);
        bus.fire({ type: 'PeerNetwork/connect', payload: { id, target, kind: 'data', reliable } });
        return res;
      },
      media() {
        const res = firstValueFrom(connected(id, target).$);
        bus.fire({ type: 'PeerNetwork/connect', payload: { id, target, kind: 'media' } });
        return res;
      },
    };
  };

  const connected = (id: string, target: string) => {
    const $ = rx
      .payload<t.PeerNetworkConnectedEvent>(event$, 'PeerNetwork/connected')
      .pipe(filter((e) => e.id === id && e.target === target));
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
