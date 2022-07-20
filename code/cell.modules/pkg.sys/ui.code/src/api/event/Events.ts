import { filter, map, share, takeUntil } from 'rxjs/operators';

import { Is, rx, slug, t } from '../common';
import { InstanceEvents } from './Events.Instance';

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

  const libs: t.CodeEditorEvents['libs'] = {
    /**
     * Remove all type libraries.
     */
    clear() {
      bus.fire({ type: 'CodeEditor/libs:clear', payload: {} });
    },

    /**
     * Load type-libraries from the network.
     */
    load: {
      req$: rx.payload<t.CodeEditorLibsLoadReqEvent>($, 'CodeEditor/libs/load:req'),
      res$: rx.payload<t.CodeEditorLibsLoadResEvent>($, 'CodeEditor/libs/load:res'),
      async fire(url, options = {}) {
        const { timeout = 3000 } = options;
        const tx = slug();

        const op = 'libs.load';
        const res$ = libs.load.res$.pipe(filter((e) => e.tx === tx));
        const first = rx.asPromise.first<t.CodeEditorLibsLoadResEvent>(res$, { op, timeout });

        bus.fire({
          type: 'CodeEditor/libs/load:req',
          payload: { url, tx },
        });

        const res = await first;
        if (res.payload) return res.payload;

        const error = res.error?.message ?? 'Failed';
        return { tx, url, files: [], error };
      },
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
