import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { t } from '../common';

type O = Record<string, unknown>;
type Event = t.StateObjectEvent;

export function create<T extends O>(
  event$: Subject<Event>,
  dispose$: Observable<any>,
): t.IStateObjectEvents<T> {
  const $ = event$.pipe(takeUntil(dispose$));

  const changing$ = $.pipe(
    filter((e) => e.type === 'StateObject/changing'),
    map((e) => e.payload as t.IStateObjectChanging<T>),
    share(),
  );

  const changed$ = $.pipe(
    filter((e) => e.type === 'StateObject/changed'),
    map((e) => e.payload as t.IStateObjectChanged<T>),
    share(),
  );

  const patched$ = changed$.pipe(
    map(
      (e): t.IStateObjectPatched => {
        const { op, cid } = e;
        const { prev, next } = e.patches;
        return { op, cid, prev, next };
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
