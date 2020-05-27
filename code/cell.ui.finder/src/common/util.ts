import { rx } from '@platform/util.value';
import { Observable } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import * as t from './types';

/**
 * Helper for monitoring when the Finder state has changed.
 */
export function onStateChanged(ctx: t.IFinderContext, unmounted$?: Observable<{}>) {
  let event$ = ctx.env.event$;
  event$ = unmounted$ ? event$.pipe(takeUntil(unmounted$)) : event$;
  return {
    on(type: t.FinderEvent['type']) {
      return rx
        .eventPayload<t.IFinderChanged>(event$, 'FINDER/changed')
        .pipe(filter((e) => e.type === type));
    },
  };
}
