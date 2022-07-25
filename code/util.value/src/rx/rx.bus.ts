import * as t from '@platform/types';
import { is } from '@platform/util.is';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { id } from '../id';
import { isEvent } from './rx.event';

type E = t.Event;

type BusFactory = <T extends E = E>(input?: Subject<any> | t.EventBus<any>) => t.EventBus<T>;
type Bus = BusFactory & {
  isBus(input: any): boolean;
  asType<T extends E>(bus: t.EventBus<any>): t.EventBus<T>;
  instance(bus: t.EventBus<any>): string;
};

/**
 * Determine if the given object in an EventBus.
 */
export function isBus(input: any) {
  if (typeof input !== 'object' || input === null) return false;
  return is.observable(input.$) && typeof input.fire === 'function';
}

/**
 * Convert a bus of one type into another type.
 */
export function busAsType<T extends E>(bus: t.EventBus<any>) {
  return bus as t.EventBus<T>;
}

/**
 * Factory for creating an event-bus.
 */
const factory: BusFactory = <T extends E = E>(input?: Subject<any> | t.EventBus<any>) => {
  if (isBus(input)) return input as t.EventBus<T>;

  const subject$ = (input as Subject<any>) || new Subject<any>();

  const res: t.EventBus<T> = {
    $: subject$.pipe(filter((e) => isEvent(e))),
    fire: (e) => subject$.next(e),
  };

  (res as any)._instance = `bus.${id.slug()}`; // NB: An instance ID for debugging sanity.

  return res;
};

/**
 * Read the "_instance" hidden ID from the bus.
 */
function instance(bus: t.EventBus<any>) {
  return ((bus ?? {}) as any)._instance ?? '';
}

/**
 * Export extended [bus] function.
 */
(factory as any).isBus = isBus;
(factory as any).asType = busAsType;
(factory as any).instance = instance;
export const bus = factory as Bus;
