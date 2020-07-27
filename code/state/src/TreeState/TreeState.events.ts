import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';
import { rx } from '@platform/util.value';
import { t } from '../common';

type Node = t.ITreeNode;
type Event = t.TreeStateEvent;

export function create<T extends Node>(
  event$: Subject<Event>,
  dispose$: Observable<any>,
): t.ITreeStateEvents<T> {
  const $ = event$.pipe(takeUntil(dispose$));
  return {
    $,
    changed$: $.pipe(
      filter((e) => e.type === 'TreeState/changed'),
      map((e) => e.payload as t.ITreeStateChanged<T>),
      share(),
    ),
    payload<E extends t.TreeStateEvent>(type: E['type']) {
      return rx.payload<E>($, type);
    },
  };
}
