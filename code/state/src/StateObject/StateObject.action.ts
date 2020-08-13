import { Observable } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { t } from '../common';

type O = Record<string, unknown>;

export function create<T extends O, A extends t.Event<any>>(
  events: t.IStateObjectEvents<T, A>,
  takeUntil$?: Observable<any>,
): t.IStateObjectAction<T, A> {
  type Event = t.IStateObjectAction<T, A>;

  const $ = !takeUntil$ ? events.$ : events.$.pipe(takeUntil(takeUntil$));
  const dispatch$ = !takeUntil$ ? events.dispatch$ : events.dispatch$.pipe(takeUntil(takeUntil$));

  const dispatched: Event['dispatched'] = (action) =>
    dispatch$.pipe(
      filter((e) => e.type === action),
      map((e) => e.payload),
      share(),
    );

  const changed: Event['changed'] = (action) =>
    $.pipe(
      filter((e) => e.type === 'StateObject/changed'),
      map((e) => e.payload as t.IStateObjectChanged<T, A>),
      filter((e) => e.action === action),
      share(),
    );

  return {
    dispatch$: dispatch$.pipe(share()),
    dispatched,
    changed,
  };
}
