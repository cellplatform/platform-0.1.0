import { Subject } from 'rxjs';
import { filter, share, takeUntil, map } from 'rxjs/operators';

import { rx, t, Is } from '../../common';
import { Fire } from './CodeEditor.Singleton.Events.fire';

const create: t.CodeEditorSingletonEventsFactory = (input) => {
  const bus = rx.bus<t.CodeEditorEvent>(input);
  const dispose$ = new Subject<void>();

  const $ = bus.event$.pipe(
    takeUntil(dispose$),
    filter((e) => Is.editorEvent(e)),
    share(),
  );

  const singleton$ = $.pipe(
    filter((e) => Is.singletonEvent(e)),
    map((e) => e as t.CodeEditorSingletonEvent),
  );

  const instance$ = $.pipe(
    filter((e) => Is.instanceEvent(e)),
    map((e) => e as t.CodeEditorInstanceEvent),
  );

  const api: t.CodeEditorSingletonEvents = {
    $,
    dispose$: dispose$.asObservable(),
    singleton$,
    instance$,
    fire: Fire(bus),
    dispose() {
      dispose$.next();
      dispose$.complete();
    },
  };

  return api;
};

export const CodeEditorSingletonEvents = { create };
