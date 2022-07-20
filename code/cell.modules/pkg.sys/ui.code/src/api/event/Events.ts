import { filter, share, takeUntil, map } from 'rxjs/operators';

import { rx, t, Is, WaitForResponse, slug } from '../common';
import { InstanceEvents } from './Events.Instance';

export const CodeEditorEvents: t.CodeEditorEventsFactory = (input, options = {}) => {
  const bus = rx.bus<t.CodeEditorEvent>(input);
  const { dispose$, dispose } = rx.disposable(options.dispose);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => Is.editorEvent(e)),
    share(),
  );

  const WaitFor = {
    Load: WaitForResponse<t.CodeEditorLibsLoadedEvent>($, 'CodeEditor/libs:loaded'),
  };

  const singleton$ = $.pipe(
    filter((e) => Is.singletonEvent(e)),
    map((e) => e as t.CodeEditorSingletonEvent),
  );

  const instance$ = $.pipe(
    filter((e) => Is.instanceEvent(e)),
    map((e) => e as t.CodeEditorInstanceEvent),
  );

  const libs: t.CodeEditorEvents['libs'] = {
    /**
     * Remove all type libraries.
     */
    clear() {
      bus.fire({ type: 'CodeEditor/libs:clear', payload: {} });
    },

    /**
     * Load type libraries at the given URL.
     */
    async load(url) {
      const tx = slug();
      const wait = WaitFor.Load.response(tx);
      bus.fire({ type: 'CodeEditor/libs:load', payload: { url, tx } });
      return (await wait).payload;
    },
  };

  const api: t.CodeEditorEvents = {
    $,
    dispose$,
    dispose,
    singleton$,
    instance$,
    libs,

    editor(id) {
      return InstanceEvents({ bus, id });
    },
  };

  return api;
};

// export const Events = { create };
