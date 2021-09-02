import { Observable, Subject, BehaviorSubject, firstValueFrom, timeout, of } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
  tap,
  catchError,
} from 'rxjs/operators';
import { rx, t, Is, WaitForResponse, slug } from '../../common';

type E = t.CodeEditorInstanceEvent;
type F = t.CodeEditorFocusChangedEvent;
type S = t.CodeEditorSelectionChangedEvent;

type A = t.CodeEditorRunActionEvent;

/**
 * Editor API
 */
export const InstanceEvents: t.CodeEditorInstanceEventsFactory = (args) => {
  const id = args.id;
  const instance = id;
  const bus = rx.bus<E>(args.bus);

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
  const focus$ = rx.payload<F>($, 'CodeEditor/changed:focus');
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
    changed$: rx.payload<S>($, 'CodeEditor/changed:selection'),
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

        bus.fire({ type: 'CodeEditor/text:req', payload: { tx, instance } });

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
    run$: rx.payload<A>($, 'CodeEditor/action:run'),
    async fire(action: t.MonacoAction) {
      const tx = slug();
      const wait = WaitFor.Action.response(tx);
      bus.fire({ type: 'CodeEditor/action:run', payload: { tx, instance, action } });
      return (await wait).payload;
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
  };

  return api;
};
