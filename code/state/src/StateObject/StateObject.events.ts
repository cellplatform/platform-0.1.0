import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { t } from '../common';

type O = Record<string, unknown>;
type Event = t.StateObjectEvent;

export function create<T extends O, A extends string>(
  event$: Subject<Event>,
  dispose$: Observable<any>,
): t.IStateObjectEvents<T, A> {
  const $ = event$.pipe(takeUntil(dispose$));

  const changing$ = $.pipe(
    filter((e) => e.type === 'StateObject/changing'),
    map((e) => e.payload as t.IStateObjectChanging<T>),
    share(),
  );

  const changed$ = $.pipe(
    filter((e) => e.type === 'StateObject/changed'),
    map((e) => e.payload as t.IStateObjectChanged<T, A>),
    share(),
  );

  const patched$ = changed$.pipe(
    map(
      (e): t.IStateObjectPatched<A> => {
        const { op, cid, action } = e;
        const { prev, next } = e.patches;
        return { op, cid, action, prev, next };
      },
    ),
  );

  const cancelled$ = $.pipe(
    filter((e) => e.type === 'StateObject/cancelled'),
    map((e) => e.payload as t.IStateObjectCancelled<T>),
    share(),
  );

  return {
    $,
    dispose$,
    changing$,
    changed$,
    patched$,
    cancelled$,
  };
}
