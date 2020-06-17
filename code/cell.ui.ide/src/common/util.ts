/**
 * Convert an input string to an object.
 */
import { rx } from '@platform/util.value';
import { Observable } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import * as t from './types';

/**
 * Helper for monitoring when the Finder state has changed.
 */
export function onStateChanged(ob$: Observable<t.AppEvent>, unmounted$?: Observable<{}>) {
  const event$ = unmounted$ ? ob$.pipe(takeUntil(unmounted$)) : ob$;
  type T = t.AppEvent['type'];
  const isTypeMatch = (type: T, match: T[]) => match.includes(type);
  return {
    on(...type: T[]) {
      return rx
        .payload<t.IIdeChanged>(event$, 'APP:IDE/changed')
        .pipe(filter((e) => isTypeMatch(e.type, type)));
    },
  };
}
