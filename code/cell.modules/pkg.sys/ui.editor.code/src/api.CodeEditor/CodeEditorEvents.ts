import { Subject } from 'rxjs';
import { filter, share, takeUntil } from 'rxjs/operators';

import { rx, t } from '../common';

type E = t.CodeEditorEvent;

const create: t.CodeEditorEventsFactory = (input, options = {}) => {
  const bus = rx.bus<E>(input);
  const dispose$ = new Subject<void>();

  const $ = bus.event$.pipe(
    takeUntil(dispose$),
    filter((e) => isCodeEditorEvent(e)),
    filter((e) => (options.instance ? e.payload.instance === options.instance : true)),
    share(),
  );

  const api: t.CodeEditorEvents = {
    $,
    dispose$: dispose$.asObservable(),

    dispose() {
      dispose$.next();
      dispose$.complete();
    },

    fire<T extends E>(e: T) {
      bus.fire(e);
      return api;
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
