import { Observable, Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { IDisposable } from '../types';

/**
 * Creates a generic disposable interface that is typically
 * mixed into a wider interface of some kind.
 */
export function disposable(until$?: Observable<any>): IDisposable {
  const dispose$ = new Subject<void>();
  if (until$) {
    until$.subscribe(() => dispose$.next());
  }
  return {
    dispose$: dispose$.pipe(share()),
    get isDisposed() {
      return dispose$.isStopped;
    },
    dispose: () => {
      dispose$.next();
      dispose$.complete();
    },
  };
}
