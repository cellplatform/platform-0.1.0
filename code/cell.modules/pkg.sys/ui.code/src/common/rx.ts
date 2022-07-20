import { firstValueFrom, Observable, of, timeout } from 'rxjs';
import { catchError, filter, take } from 'rxjs/operators';

import { rx } from './libs';
import * as t from './types';

/**
 * Helper for waiting for an event response.
 */
export const WaitForResponse = <E extends t.Event>($: t.Observable<any>, type: E['type']) => {
  return {
    response(tx: string) {
      return new Promise<E>((resolve, reject) => {
        rx.event<E>($, type)
          .pipe(
            take(1),
            filter((e) => e.payload.tx === tx),
          )
          .subscribe((e) => resolve(e));
      });
    },
  };
};
