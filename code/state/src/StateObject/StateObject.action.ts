import { Observable } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { t } from '../common';

type O = Record<string, unknown>;

export function create<T extends O, E extends t.Event<any>>(
  events: t.IStateObjectEvents<T, E>,
  takeUntil$?: Observable<any>,
): t.IStateObjectAction<T, E> {
  type A = t.IStateObjectAction<T, E>;

  const $ = !takeUntil$ ? events.$ : events.$.pipe(takeUntil(takeUntil$));
  const dispatch$ = !takeUntil$ ? events.dispatch$ : events.dispatch$.pipe(takeUntil(takeUntil$));

  const dispatched: A['dispatched'] = (action) =>
    dispatch$.pipe(
      filter((e) => e.type === action),
      map((e) => e.payload),
      share(),
    );

  const changed: A['changed'] = (action) =>
    $.pipe(
      filter((e) => e.type === 'StateObject/changed'),
      map((e) => e.payload as t.IStateObjectChanged<T, E>),
      filter((e) => e.action === action),
      share(),
    );

  return {
    dispatched,
    changed,
  };
}
