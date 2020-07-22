import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { rx, t } from '../common';

type Event = t.TreeNavEvent;

export function createEvents(dispose$: Observable<any>): t.ITreeNavControllerEvents {
  const event$ = new Subject<t.TreeNavEvent>();
  const $ = event$.pipe(takeUntil(dispose$));

  const payload = <E extends Event>(type: E['type']) => rx.payload<E>($, type);
  const fire: t.FireEvent<Event> = (e) => event$.next(e);
  const change$ = payload<t.ITreeNavControllerChangeEvent>('TreeNav/change');
  const changed$ = payload<t.ITreeNavControllerChangedEvent>('TreeNav/changed');

  return {
    $,
    change$,
    changed$,
    payload,
    fire,
  };
}
