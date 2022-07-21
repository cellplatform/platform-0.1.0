import { filter } from 'rxjs/operators';
import { rx, slug, t } from '../common';

/**
 * Fire events related to loading type "libraries" within the editor.
 */
export function CodeEditorLibEvents(args: {
  bus: t.CodeEditorEventBus;
  $: t.Observable<t.CodeEditorEvent>;
}): t.CodeEditorLibEvents {
  const { bus, $ } = args;

  const libs: t.CodeEditorLibEvents = {
    /**
     * Remove all type libraries.
     */
    clear: {
      req$: rx.payload<t.CodeEditorLibsClearReqEvent>($, 'CodeEditor/libs/clear:req'),
      res$: rx.payload<t.CodeEditorLibsClearResEvent>($, 'CodeEditor/libs/clear:res'),
      async fire(options = {}) {
        const { timeout = 1000 } = options;
        const tx = slug();

        const op = 'libs.clear';
        const res$ = libs.clear.res$.pipe(filter((e) => e.tx === tx));
        const first = rx.asPromise.first<t.CodeEditorLibsClearResEvent>(res$, { op, timeout });

        bus.fire({
          type: 'CodeEditor/libs/clear:req',
          payload: { tx },
        });

        const res = await first;
        if (res.payload) return res.payload;

        const error = res.error?.message ?? 'Failed';
        return { tx, error };
      },
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

  return libs;
}
