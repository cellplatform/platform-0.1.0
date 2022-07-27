import * as t from '@platform/types';
import { is } from '@platform/util.is';

/**
 * Read the "_instance" hidden ID from the bus.
 */
export function instance(bus: t.EventBus<any>) {
  return ((bus ?? {}) as any)._instance ?? '';
}

/**
 * Convert a bus of one type into another type.
 */
export function busAsType<E extends t.Event>(bus: t.EventBus<any>) {
  return bus as t.EventBus<E>;
}

/**
 * Determine if the given object in an EventBus.
 */
export function isBus(input: any) {
  if (typeof input !== 'object' || input === null) return false;
  return is.observable(input.$) && typeof input.fire === 'function';
}
