import * as t from '@platform/types';
import { is } from '@platform/util.is';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isEvent } from './rx.event';

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
 * Convert a bus of one type into another type.
 */
export function busType<T extends E>(bus: t.EventBus<any>) {
  return bus as t.EventBus<T>;
}
