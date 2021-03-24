import { firstValueFrom, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { cuid, rx, t } from '../../common';

/**
 * Helpers for working with <PeerEvents> events.
 */
export function PeerEvents(args: { bus: t.EventBus<any> }) {
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = args.bus.type<t.PeerEvent>();
  const event$ = bus.event$.pipe(takeUntil(dispose$));

  /**
   * CREATE
   */
  const create = (signal: string, options: { id?: string } = {}) => {
    const id = options.id || cuid();
    const res = firstValueFrom(created(id).$);
    bus.fire({ type: 'Peer/create', payload: { id, signal } });
    return res;
  };

  /**
   * CREATED
   */
  const created = (id: string) => {
    const $ = rx
      .payload<t.PeerCreatedEvent>(event$, 'Peer/created')
      .pipe(filter((e) => e.id === id));
    return { id, $ };
  };

  /**
   * STATUS
   */
  const status = (id?: string) => {
    const request$ = rx
      .payload<t.PeerStatusRequestEvent>(event$, 'Peer/status:req')
      .pipe(filter((e) => e.id === id));
    const response$ = rx
      .payload<t.PeerStatusResponseEvent>(event$, 'Peer/status:res')
      .pipe(filter((e) => e.id === id));

    const get = () => {
      const res = firstValueFrom(response$);
      bus.fire({ type: 'Peer/status:req', payload: { id } });
      return res;
    };

    return { id, get, request$, response$ };
  };

  return {
    dispose,
    dispose$: dispose$.asObservable(),

    create,
    created,
    status,
  };
}
