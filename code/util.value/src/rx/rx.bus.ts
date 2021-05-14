import * as t from '@platform/types';
import { is } from '@platform/util.is';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

type E = t.Event;

/**
 * Factory for creating an event-bus.
 */
export function bus<T extends E = E>(input?: Subject<any> | t.EventBus<any>): t.EventBus<T> {
  if (isBus(input)) return input as t.EventBus<T>;

  const subject$ = (input as Subject<any>) || new Subject<any>();

  const res: t.EventBus<T> = {
    event$: subject$.pipe(filter((e) => isEvent(e))),
    type: <T extends E>() => res as unknown as t.EventBus<T>,
    fire: (e) => subject$.next(e),
  };

  return res;
}

/**
 * Determine if the given object in an EventBus.
 */
export function isBus(input: any) {
  if (typeof input !== 'object' || input === null) return false;
  return is.observable(input.event$) && typeof input.fire === 'function';
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
export function isEvent(input: any): boolean {
  return (
    input !== null &&
    typeof input === 'object' &&
    typeof input.type === 'string' &&
    typeof input.payload === 'object'
  );
}
