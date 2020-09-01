import * as t from '@platform/types';
import { Subject } from 'rxjs';
import { share, filter } from 'rxjs/operators';

type E = t.Event;

/**
 * Factory for creating an event-bus.
 */
export function bus<T extends E = E>(source$?: Subject<any>): t.EventBus<T> {
  const subject$ = source$ || new Subject<any>();

  const res: t.EventBus<T> = {
    type: <T extends E>() => (res as unknown) as t.EventBus<T>,
    event$: subject$.pipe(
      filter((e) => isEvent(e)),
      share(),
    ),
    fire(e) {
      subject$.next(e);
    },
    filter<T extends E = E>(fn: t.EventBusFilter<T>) {
      const clone$ = new Subject<T>();
      clone$.pipe(filter((e) => fn(e))).subscribe((e) => subject$.next(e));
      return bus<T>(clone$);
    },
  };

  return res;
}

/**
 * Determine if the given object is the shape of
 * a standard [Event], eg:
 *
 *    {
 *      type: string,
 *      payload: { ... }
 *    }
 *
 */
export function isEvent(e: any): boolean {
  return (
    e !== null &&
    typeof e === 'object' &&
    typeof e.type === 'string' &&
    typeof e.payload === 'object'
  );
}
