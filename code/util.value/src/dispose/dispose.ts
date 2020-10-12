import { IDisposable } from '@platform/types';
import { Observable, Subject } from 'rxjs';
import { share } from 'rxjs/operators';

export const dispose = {
  /**
   * Creates a generic disposable interface that is typically
   * mixed into a wider interface of some kind.
   */
  create(until$?: Observable<any>): IDisposable {
    const dispose$ = new Subject<void>();
    const disposable = {
      dispose$: dispose$.pipe(share()),
      dispose: () => {
        dispose$.next();
        dispose$.complete();
      },
    };

    if (until$) {
      until$.subscribe(() => dispose$.next());
    }

    return disposable;
  },

  /**
   * Listens to an observable and disposes of the object when fires.
   */
  until(disposable: IDisposable, until$?: Observable<any>): IDisposable {
    if (until$) {
      until$.subscribe(() => disposable.dispose());
    }
    return disposable;
  },
};
