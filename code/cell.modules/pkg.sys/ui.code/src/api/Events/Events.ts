import { filter, map, share, takeUntil } from 'rxjs/operators';

import { Is, rx, t, slug } from '../common';
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

  const init: t.CodeEditorEvents['init'] = {
    req$: rx.payload<t.CodeEditorInitReqEvent>($, 'sys.ui.code/init:req'),
    res$: rx.payload<t.CodeEditorInitResEvent>($, 'sys.ui.code/init:res'),
    async fire(args) {
      const { timeout = 3000, staticRoot } = args;
      const tx = slug();

      const op = 'init';
      const res$ = init.res$.pipe(filter((e) => e.tx === tx));
      const first = rx.asPromise.first<t.CodeEditorInitResEvent>(res$, { op, timeout });

      bus.fire({
        type: 'sys.ui.code/init:req',
        payload: { tx, staticRoot },
      });

      const res = await first;
      if (res.payload) return res.payload;

      const error = res.error?.message ?? 'Failed';
      return { tx, error };
    },
  };

  const status: t.CodeEditorEvents['status'] = {
    req$: rx.payload<t.CodeEditorStatusReqEvent>($, 'sys.ui.code/status:req'),
    res$: rx.payload<t.CodeEditorStatusResEvent>($, 'sys.ui.code/status:res'),
    async get(options) {
      return (await status.fire(options))?.info;
    },
    async fire(options = {}) {
      const { timeout = 3000 } = options;
      const tx = slug();

      const op = 'status.get';
      const res$ = status.res$.pipe(filter((e) => e.tx === tx));
      const first = rx.asPromise.first<t.CodeEditorStatusResEvent>(res$, { op, timeout });

      bus.fire({
        type: 'sys.ui.code/status:req',
        payload: { tx },
      });

      const res = await first;
      if (res.payload) return res.payload;

      const error = res.error?.message ?? 'Failed';
      return { tx, error };
    },
  };

  const libs = CodeEditorLibEvents({ bus, $ });

  const api: t.CodeEditorEvents = {
    id: rx.bus.instance(bus),
    $,
    dispose$,
    dispose,
    singleton$,
    instance$,

    init,
    status,
    libs,

    editor(id) {
      return CodeEditorInstanceEvents({ bus, id });
    },
  };

  return api;
};
