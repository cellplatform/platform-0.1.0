import { filter, map, share, takeUntil } from 'rxjs/operators';

import { Is, rx, t } from '../common';
import { CodeEditorInstanceEvents } from './Events.Instance';
import { CodeEditorLibEvents } from './Events.Libs';

export const CodeEditorEvents: t.CodeEditorEventsFactory = (input, options = {}) => {
  const bus = rx.bus<t.CodeEditorEvent>(input);
  const { dispose$, dispose } = rx.disposable(options.dispose);

  const $ = bus.$.pipe(
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

  const libs = CodeEditorLibEvents({ bus, $ });

  const api: t.CodeEditorEvents = {
    $,
    dispose$,
    dispose,
    singleton$,
    instance$,
    libs,

    editor(id) {
      return CodeEditorInstanceEvents({ bus, id });
    },
  };

  return api;
};
