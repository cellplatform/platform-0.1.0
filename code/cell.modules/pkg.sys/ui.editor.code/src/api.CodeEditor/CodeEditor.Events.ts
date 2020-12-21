import { Subject } from 'rxjs';
import { filter, share, takeUntil, map } from 'rxjs/operators';

import { rx, t } from '../common';

type E = t.CodeEditorEvent;
type F = t.ICodeEditorFocusChangedEvent;
type S = t.ICodeEditorSelectionChangedEvent;

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

  const fire = (instance: string): t.CodeEditorEventsFire => {
    return {
      instance,
      focus() {
        bus.fire({ type: 'CodeEditor/change:focus', payload: { instance } });
      },
      select(selection, options = {}) {
        const { focus } = options;
        bus.fire({ type: 'CodeEditor/change:selection', payload: { instance, selection, focus } });
      },
    };
  };

  const api: t.CodeEditorEvents = {
    $,
    dispose$: dispose$.asObservable(),
    focus$: focus$.pipe(filter((e) => e.isFocused)),
    blur$: focus$.pipe(filter((e) => !e.isFocused)),
    selection$,
    fire,
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
