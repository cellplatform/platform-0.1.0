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

  const isTypeMatch = (type: T, match: T[]) => {
    return match.includes(type);
  };

  return {
    on(...type: T[]) {
      return rx
        .payload<t.IFinderChanged>(event$, 'APP:FINDER/changed')
        .pipe(filter((e) => isTypeMatch(e.type, type)));
    },
  };
}
