import { rx } from '@platform/util.value';
import { filter } from 'rxjs/operators';

import * as t from './types';

export function onStateChanged<T>(
  ctx: t.IFinderContext,
  type: t.FinderEvent['type'],
  callback: (e: t.IStateChange<t.IFinderState, t.FinderEvent>) => void,
) {
  rx.eventPayload<t.IFinderChanged>(ctx.env.event$, 'FINDER/changed')
    .pipe(filter((e) => e.type === type))
    .subscribe((e) => callback(e));
}
