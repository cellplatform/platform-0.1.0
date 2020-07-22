import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { t } from '../common';

type O = Record<string, unknown>;
type Event = t.StateObjectEvent;

export function create<T extends O, E extends t.Event<any>>(
  event$: Subject<Event>,
  dispose$: Observable<any>,
): t.IStateObjectEvents<T, E> {
  const $ = event$.pipe(takeUntil(dispose$));
  return {
    $,
    changing$: $.pipe(
      filter((e) => e.type === 'StateObject/changing'),
      map((e) => e.payload as t.IStateObjectChanging<T>),
      share(),
    ),
    changed$: $.pipe(
      filter((e) => e.type === 'StateObject/changed'),
      map((e) => e.payload as t.IStateObjectChanged<T, E>),
      share(),
    ),
    cancelled$: $.pipe(
      filter((e) => e.type === 'StateObject/cancelled'),
      map((e) => e.payload as t.IStateObjectCancelled<T>),
      share(),
    ),
    dispatch$: $.pipe(
      filter((e) => e.type === 'StateObject/dispatch'),
      map((e) => (e.payload as t.IStateObjectDispatch<E>).event),
      share(),
    ),
  };
}
