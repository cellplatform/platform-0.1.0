import { filter, share, takeUntil } from 'rxjs/operators';
import { Is, rx, slug, t, time } from '../common';

/**
 * Editor API
 */
export const CodeEditorInstanceEvents: t.CodeEditorInstanceEventsFactory = (args) => {
  const instance = args.id;
  const bus = rx.bus<t.CodeEditorInstanceEvent>(args.bus);
  const { dispose, dispose$ } = rx.disposable(args.dispose$);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => Is.instanceEvent(e)),
    filter((e) => (instance ? e.payload.instance === instance : true)),
    share(),
  );

  /**
   * Focus
   */
  const focused$ = rx.payload<t.CodeEditorFocusedEvent>($, 'sys.ui.code/focused');
  const focus: t.CodeEditorInstanceEvents['focus'] = {
    changed$: focused$.pipe(filter((e) => e.isFocused)),
    fire() {
      bus.fire({
        type: 'sys.ui.code/focus',
        payload: { instance },
      });
    },
  };

  /**
   * Blur (lost focus)
   */
  const blur: t.CodeEditorInstanceEvents['blur'] = {
    changed$: focused$.pipe(filter((e) => !e.isFocused)),
  };

  /**
   * Selection
   */
  const selection: t.CodeEditorInstanceEvents['selection'] = {
    changed$: rx.payload<t.CodeEditorSelectionChangedEvent>($, 'sys.ui.code/changed:selection'),
    select(selection, options = {}) {
      const { focus } = options;
      bus.fire({
        type: 'sys.ui.code/change:selection',
        payload: { instance, selection, focus },
      });
    },
  };

  /**
   * Text
   */
  const text: t.CodeEditorInstanceEvents['text'] = {
    changed$: rx.payload<t.CodeEditorTextChangedEvent>($, 'sys.ui.code/changed:text'),
    set(text) {
      bus.fire({ type: 'sys.ui.code/change:text', payload: { instance, text } });
    },
    get: {
      req$: rx.payload<t.CodeEditorTextReqEvent>($, 'sys.ui.code/text:req'),
      res$: rx.payload<t.CodeEditorTextResEvent>($, 'sys.ui.code/text:res'),

      async fire(options = {}) {
        const { timeout = 1000 } = options;
        const tx = slug();

        const op = 'text.get';
        const res$ = text.get.res$.pipe(filter((e) => e.tx === tx));
        const first = rx.asPromise.first<t.CodeEditorTextResEvent>(res$, { op, timeout });

        bus.fire({
          type: 'sys.ui.code/text:req',
          payload: { tx, instance },
        });

        const res = await first;
        if (res.error) throw new Error(res.error.message);
        return res.payload?.text ?? '';
      },
    },
  };

  /**
   * Action (commands)
   */
  const action: t.CodeEditorInstanceEvents['action'] = {
    req$: rx.payload<t.CodeEditorRunActionReqEvent>($, 'sys.ui.code/action:req'),
    res$: rx.payload<t.CodeEditorRunActionResEvent>($, 'sys.ui.code/action:res'),
    async fire(cmd: t.MonacoAction, options = {}) {
      const { timeout = 3000 } = options;
      const tx = slug();

      const op = 'action';
      const res$ = action.res$.pipe(filter((e) => e.tx === tx));
      const first = rx.asPromise.first<t.CodeEditorRunActionResEvent>(res$, { op, timeout });

      const timer = time.timer();
      bus.fire({
        type: 'sys.ui.code/action:req',
        payload: { tx, instance, action: cmd },
      });

      const res = await first;
      if (res.payload) return res.payload;

      const error = res.error?.message ?? 'Failed';
      const elapsed = timer.elapsed.msec;
      return { tx, instance, elapsed, error };
    },
  };

  /**
   * Model
   */
  const model: t.CodeEditorInstanceEvents['model'] = {
    req$: rx.payload<t.CodeEditorModelReqEvent>($, 'sys.ui.code/model:req'),
    res$: rx.payload<t.CodeEditorModelResEvent>($, 'sys.ui.code/model:res'),

    async get(options = {}) {
      return model.set.fire(undefined, options);
    },

    set: {
      language: (language, options) => model.set.fire({ language }, options),
      async fire(change, options = {}) {
        const { timeout = 1000 } = options;
        const tx = slug();

        const op = 'set';
        const res$ = model.res$.pipe(filter((e) => e.tx === tx));
        const first = rx.asPromise.first<t.CodeEditorModelResEvent>(res$, { op, timeout });

        bus.fire({
          type: 'sys.ui.code/model:req',
          payload: { tx, instance, change },
        });

        const res = await first;
        if (res.payload) return res.payload.model;

        const error = res.error?.message ?? 'Failed';
        throw new Error(error);
      },
    },
  };

  const api: t.CodeEditorInstanceEvents = {
    instance: { bus: rx.bus.instance(bus), id: args.id },
    $,
    dispose$,
    dispose,

    focus,
    blur,
    selection,
    text,
    action,
    model,
  };

  return api;
};
