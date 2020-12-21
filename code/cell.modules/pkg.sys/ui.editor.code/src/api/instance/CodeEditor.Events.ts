import { Subject } from 'rxjs';
import { filter, share, takeUntil } from 'rxjs/operators';

import { rx, t } from '../../common';
import { Fire } from './CodeEditor.Events.fire';

type E = t.CodeEditorEvent;
type F = t.ICodeEditorFocusChangedEvent;
type S = t.ICodeEditorSelectionChangedEvent;
type T = t.ICodeEditorTextChangedEvent;

const create: t.CodeEditorEventsFactory = (input, options = {}) => {
  const bus = rx.bus<E>(input);
  const dispose$ = new Subject<void>();

  const $ = bus.event$.pipe(
    takeUntil(dispose$),
    filter((e) => isCodeEditorEvent(e)),
    filter((e) => (options.instance ? e.payload.instance === options.instance : true)),
    share(),
  );

  const focus$ = rx.payload<F>($, 'CodeEditor/changed:focus');
  const selection$ = rx.payload<S>($, 'CodeEditor/changed:selection');
  const text$ = rx.payload<T>($, 'CodeEditor/changed:text');

  const api: t.CodeEditorEvents = {
    $,
    dispose$: dispose$.asObservable(),
    focus$: focus$.pipe(filter((e) => e.isFocused)),
    blur$: focus$.pipe(filter((e) => !e.isFocused)),
    selection$,
    text$,
    fire(instance) {
      return Fire(bus, instance);
    },
    dispose() {
      dispose$.next();
      dispose$.complete();
    },
  };

  return api;
};

/**
 * Helpers for working with code editor event observables.
 */
export const CodeEditorEvents = {
  create,
};

/**
 * Helpers
 */
const isCodeEditorEvent = (e: t.Event) => e.type.startsWith('CodeEditor/');
