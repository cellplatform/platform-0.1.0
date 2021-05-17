import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

/**
 * Filters on the given event.
 */
export function event<E extends { type: string; payload: unknown }>(
  ob$: Observable<unknown>,
  type: E['type'],
) {
  return ob$.pipe(
    filter((e: any) => e.type === type),
    map((e: any) => e as E),
  );
}

/**
 * Filters on the given event returning the payload.
 */
export function payload<E extends { type: string; payload: unknown }>(
  ob$: Observable<unknown>,
  type: E['type'],
) {
  return ob$.pipe(
    filter((e: any) => e.type === type),
    map((e: any) => e.payload as E['payload']),
  );
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
