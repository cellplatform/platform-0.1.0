import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

/**
 * Filters on the given event.
 */
export function event<E extends { type: string; payload: unknown }>(
  ob$: Observable<{}>,
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
  ob$: Observable<{}>,
  type: E['type'],
) {
  return ob$.pipe(
    filter((e: any) => e.type === type),
    map((e: any) => e.payload as E['payload']),
  );
}
