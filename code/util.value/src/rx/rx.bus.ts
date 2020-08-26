import * as t from '@platform/types';
import { Subject } from 'rxjs';
import { share, filter } from 'rxjs/operators';

/**
 * Factory for creates an event-bus.
 */
export function bus<T extends t.Event = t.Event>(source$?: Subject<any>): t.EventBus<T> {
  const event$ = source$ || new Subject<any>();

  const bus: t.EventBus<T> = {
    event$: event$.pipe(
      filter((e) => isEvent(e)),
      share(),
    ),
    fire: (e) => event$.next(e),
    type: <T extends t.Event>() => (bus as unknown) as t.EventBus<T>,
  };

  return bus;
}

/**
 * [Helpers]
 */

export function isEvent(e: any): boolean {
  return (
    e !== null &&
    typeof e === 'object' &&
    typeof e.type === 'string' &&
    typeof e.payload === 'object'
  );
}
