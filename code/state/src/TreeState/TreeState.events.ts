import { rx } from '@platform/util.value';
import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { t } from '../common';

type Node = t.ITreeNode;

export function create<T extends Node, A extends string>(args: {
  event$: Subject<t.TreeStateEvent>;
  until$: Observable<any>;
}): t.ITreeStateEvents<T, A> {
  const $ = args.event$.pipe(takeUntil(args.until$));

  const changed$ = $.pipe(
    filter((e) => e.type === 'TreeState/changed'),
    map((e) => e.payload as t.ITreeStateChanged<T, A>),
    share(),
  );

  const patched$ = $.pipe(
    filter((e) => e.type === 'TreeState/patched'),
    map((e) => e.payload as t.ITreeStatePatched<A>),
    share(),
  );

  const childAdded$ = $.pipe(
    filter((e) => e.type === 'TreeState/child/added'),
    map((e) => e.payload as t.ITreeStateChildAdded),
    share(),
  );

  const childRemoved$ = $.pipe(
    filter((e) => e.type === 'TreeState/child/removed'),
    map((e) => e.payload as t.ITreeStateChildRemoved),
    share(),
  );

  type P = t.TreeStateEvent;

  return {
    $,
    changed$,
    patched$,
    childAdded$,
    childRemoved$,
    payload: (type: P['type']) => rx.payload<P>($, type),
  };
}
