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

  const create = (signal: string, options: { id?: string } = {}) => {
    const id = options.id || cuid();
    const res = firstValueFrom(created(id).$);
    bus.fire({ type: 'Peer/create', payload: { id, signal } });
    return res;
  };

  const created = (id: string) => {
    const $ = rx
      .payload<t.PeerCreatedEvent>(event$, 'Peer/created')
      .pipe(filter((e) => e.id === id));
    return { id, $ };
  };

  return {
    dispose,
    dispose$: dispose$.asObservable(),

    connect: create,
    connected: created,
  };
}
