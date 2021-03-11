import { Subject } from 'rxjs';
import { filter, share, takeUntil } from 'rxjs/operators';

import { rx, t, Is } from '../../common';
import { Fire } from './Instance.Events.fire';

type E = t.CodeEditorInstanceEvent;
type F = t.ICodeEditorFocusChangedEvent;
type S = t.ICodeEditorSelectionChangedEvent;
type T = t.ICodeEditorTextChangedEvent;

const create: t.CodeEditorInstanceEventsFactory = (input, instance) => {
  const bus = rx.bus<E>(input);
  const dispose$ = new Subject<void>();

  const $ = bus.event$.pipe(
    takeUntil(dispose$),
    filter((e) => Is.instanceEvent(e)),
    filter((e) => (instance ? e.payload.instance === instance : true)),
    share(),
  );

  const focus$ = rx.payload<F>($, 'CodeEditor/changed:focus');
  const selection$ = rx.payload<S>($, 'CodeEditor/changed:selection');
  const text$ = rx.payload<T>($, 'CodeEditor/changed:text');

  const api: t.CodeEditorInstanceEvents = {
    id: instance,
    $,
    dispose$: dispose$.asObservable(),
    focus$: focus$.pipe(filter((e) => e.isFocused)),
    blur$: focus$.pipe(filter((e) => !e.isFocused)),
    selection$,
    text$,
    fire: Fire(bus, instance),
    dispose() {
      dispose$.next();
      dispose$.complete();
    },
  };

  return api;
};

export const InstanceEvents = { create };
