import { Observable } from 'rxjs';
import { buffer, debounceTime, publishReplay, refCount } from 'rxjs/operators';

/**
 * Debounces a series of events returning an array of the buffered values.
 *
 * Idea sourced from:
 *    https://stackoverflow.com/a/35739707/1745661
 *    http://jsbin.com/pubowum/7/edit?js,console,output
 */
export function debounceBuffer<T>(ob$: Observable<T>, debounce: number = 0) {
  const shared$ = ob$.pipe(
    publishReplay(1),
    refCount(),
  );
  return shared$.pipe(buffer(shared$.pipe(debounceTime(debounce))));
}
