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
    bus.fire({ type: 'PeerNetwork/create', payload: { ref: id, signal } });
    return res;
  };

  /**
   * CREATED
   */
  const created = (ref: string) => {
    const $ = rx
      .payload<t.PeerNetworkCreatedEvent>(event$, 'PeerNetwork/created')
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
      bus.fire({ type: 'PeerNetwork/status:req', payload: { ref: ref } });
      return res;
    };

    return { id: ref, get, request$, response$ };
  };

  /**
   * PURGE
   */
  const purge = () => {
    /**
     * TODO 🐷
     */
  };

  /**
   * CONNECT
   */
  const connect = (ref: string, target: string) => {
    return {
      data(options: { reliable?: boolean } = {}) {
        const { reliable } = options;
        const res = firstValueFrom(connected(ref, target).$);
        bus.fire({
          type: 'PeerNetwork/connect',
          payload: { ref: ref, target: target, kind: 'data', reliable },
        });
        return res;
      },
      media() {
        const res = firstValueFrom(connected(ref, target).$);
        bus.fire({
          type: 'PeerNetwork/connect',
          payload: { ref: ref, target: target, kind: 'media' },
        });
        return res;
      },
    };
  };

  const connected = (id: string, remote: string) => {
    const $ = rx
      .payload<t.PeerNetworkConnectedEvent>(event$, 'PeerNetwork/connected')
      .pipe(filter((e) => e.ref === id && e.target === remote));
    return { id, $ };
  };

  return {
    dispose,
    dispose$: dispose$.asObservable(),

    $: event$,
    create,
    created,
    status,
    purge,
    connect,
  };
}
