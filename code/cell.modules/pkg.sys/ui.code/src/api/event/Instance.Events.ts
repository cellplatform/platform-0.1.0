import { firstValueFrom, of, Subject, timeout } from 'rxjs';
import { catchError, filter, share, takeUntil } from 'rxjs/operators';

import { Is, rx, slug, t, WaitForResponse } from '../../common';

/**
 * Editor API
 */
export const InstanceEvents: t.CodeEditorInstanceEventsFactory = (args) => {
  const id = args.id;
  const instance = id;
  const bus = rx.bus<t.CodeEditorInstanceEvent>(args.bus);

  const dispose$ = new Subject<void>();
  const dispose = () => {
    dispose$.next();
    dispose$.complete();
  };

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => Is.instanceEvent(e)),
    filter((e) => (id ? e.payload.instance === id : true)),
    share(),
  );

  const WaitFor = {
    Action: WaitForResponse<t.CodeEditorActionCompleteEvent>($, 'CodeEditor/action:complete'),
    // GetText: WaitForResponse<t.CodeEditorTextResEvent>($, 'CodeEditor/text:res'),
  };

  /**
   * Focus
   */
  const focus$ = rx.payload<t.CodeEditorFocusChangedEvent>($, 'CodeEditor/changed:focus');
  const focus: t.CodeEditorInstanceEvents['focus'] = {
    changed$: focus$.pipe(filter((e) => e.isFocused)),
    fire() {
      bus.fire({ type: 'CodeEditor/change:focus', payload: { instance } });
    },
  };

  /**
   * Blur (lost focus)
   */
  const blur: t.CodeEditorInstanceEvents['blur'] = {
    changed$: focus$.pipe(filter((e) => !e.isFocused)),
  };

  /**
   * Selection
   */
  const selection: t.CodeEditorInstanceEvents['selection'] = {
    changed$: rx.payload<t.CodeEditorSelectionChangedEvent>($, 'CodeEditor/changed:selection'),
    select(selection, options = {}) {
      const { focus } = options;
      bus.fire({
        type: 'CodeEditor/change:selection',
        payload: { instance, selection, focus },
      });
    },
  };

  /**
   * Text
   */
  const text: t.CodeEditorInstanceEvents['text'] = {
    changed$: rx.payload<t.CodeEditorTextChangedEvent>($, 'CodeEditor/changed:text'),
    set(text) {
      bus.fire({ type: 'CodeEditor/change:text', payload: { instance, text } });
    },
    get: {
      req$: rx.payload<t.CodeEditorTextReqEvent>($, 'CodeEditor/text:req'),
      res$: rx.payload<t.CodeEditorTextResEvent>($, 'CodeEditor/text:res'),

      async fire(options = {}) {
        const tx = slug();
        const msecs = options.timeout ?? 1000;
        const first = firstValueFrom(
          text.get.res$.pipe(
            filter((e) => e.tx === tx),
            timeout(msecs),
            catchError(() => of(`[Text] request timed out after ${msecs} msecs`)),
          ),
        );

        bus.fire({
          type: 'CodeEditor/text:req',
          payload: { tx, instance },
        });

        const res = await first;
        if (typeof res === 'string') throw new Error(res);
        return res.text;
      },
    },
  };

  /**
   * Action (commands)
   */
  const action: t.CodeEditorInstanceEvents['action'] = {
    run$: rx.payload<t.CodeEditorRunActionEvent>($, 'CodeEditor/action:run'),
    async fire(action: t.MonacoAction) {
      const tx = slug();
      const wait = WaitFor.Action.response(tx);
      bus.fire({ type: 'CodeEditor/action:run', payload: { tx, instance, action } });
      return (await wait).payload;
    },
  };

  /**
   * Model
   */
  const model: t.CodeEditorInstanceEvents['model'] = {
    req$: rx.payload<t.CodeEditorModelReqEvent>($, 'CodeEditor/model:req'),
    res$: rx.payload<t.CodeEditorModelResEvent>($, 'CodeEditor/model:res'),

    async get(options = {}) {
      return model.set.fire(undefined, options);
    },

    set: {
      language: (language, options) => model.set.fire({ language }, options),
      async fire(change, options = {}) {
        const tx = slug();
        const msecs = options.timeout ?? 1000;
        const first = firstValueFrom(
          model.res$.pipe(
            filter((e) => e.tx === tx),
            timeout(msecs),
            catchError(() => of(`[Model] request timed out after ${msecs} msecs`)),
          ),
        );

        bus.fire({
          type: 'CodeEditor/model:req',
          payload: { tx, instance, change },
        });

        const res = await first;
        if (typeof res === 'string') throw new Error(res);
        return res.model;
      },
    },
  };

  const api: t.CodeEditorInstanceEvents = {
    id,
    $,
    dispose$: dispose$.asObservable(),
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
