import { Observable, Subject, merge } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';
import { rx } from '@platform/util.value';
import { t } from '../common';

type Node = t.ITreeNode;

export function create<T extends Node, A extends t.Event>(args: {
  event$: Subject<t.TreeStateEvent>;
  dispatch$: Observable<A>;
  dispose$: Observable<any>;
}): t.ITreeStateEvents<T, A> {
  const dispatch$ = args.dispatch$.pipe(takeUntil(args.dispose$));
  const event$ = args.event$.pipe(takeUntil(args.dispose$));
  const $ = merge(event$, dispatch$);

  const changed$ = event$.pipe(
    filter((e) => e.type === 'TreeState/changed'),
    map((e) => e.payload as t.ITreeStateChanged<T>),
    share(),
  );

  const removed$ = event$.pipe(
    filter((e) => e.type === 'TreeState/child/removed'),
    map((e) => e.payload as t.ITreeStateChildRemoved),
    share(),
  );

  type P = t.TreeStateEvent | A;

  return {
    $,
    changed$,
    removed$,
    dispatch$,
    payload: (type: P['type']) => rx.payload<P>($, type),
  };
}
