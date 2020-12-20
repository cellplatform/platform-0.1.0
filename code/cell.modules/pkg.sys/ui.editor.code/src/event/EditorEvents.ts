import { filter, map, share } from 'rxjs/operators';
import { rx, t } from '../common';

type E = t.CodeEditorEvent;

/**
 * Helpers for working with code editor event observables.
 */
export const EditorEvents: t.CodeEditorEventsFactory = (input) => {
  const bus = rx.bus<E>(input);
  const $ = bus.event$.pipe(
    filter((e) => e.type.startsWith('Monaco/') || e.type.startsWith('CodeEditor/')),
  );

  const api = {
    fire<T extends E>(e: T) {
      bus.fire(e);
      return api;
    },
    $: $.pipe(share()),
    editor$: $.pipe(
      filter((e) => e.type.startsWith('CodeEditor/')),
      map((e) => e as t.CodeEditorComponentEvent),
    ),
  };

  return api;
};
