import { filter, takeUntil } from 'rxjs/operators';
import { rx, t, TextInput, Json } from '../common';
import { Util } from '../Util';

/**
 * Event API.
 */
export function CmdBarEvents(args: {
  instance: t.CmdBarInstance;
  initial?: t.CmdBarState;
  dispose$?: t.Observable<any>;
}) {
  const { dispose, dispose$ } = rx.disposable();
  args.dispose$?.subscribe(dispose);

  const instance = args.instance.id;
  const bus = rx.busAsType<t.CmdBarEvent>(args.instance.bus);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.payload.instance === instance),
    filter((e) => e.type.startsWith('sys.ui.CmdBar/')),
  );

  const json = Json.Bus.Events({ instance: args.instance, dispose$ }).json<t.CmdBarState>(
    args.initial ?? Util.defaultState(),
    { key: 'CmdBar' },
  );
  const state = json.lens((root) => root);
  const textbox = TextInput.Events({ instance: args.instance, dispose$ });

  const action: t.CmdBarEvents['action'] = {
    $: rx.payload<t.CmdBarActionEvent>($, 'sys.ui.CmdBar/Action'),
    fire(args) {
      const { text, kind } = args;
      bus.fire({
        type: 'sys.ui.CmdBar/Action',
        payload: { instance, text, kind },
      });
    },
  };

  const text: t.CmdBarEvents['text'] = {
    changed$: rx.payload<t.CmdBarTextChangeEvent>($, 'sys.ui.CmdBar/TextChanged'),
    onChange___(text) {
      bus.fire({
        type: 'sys.ui.CmdBar/TextChanged',
        payload: { instance, text },
      });
    },
    focus: () => textbox.focus.fire(true),
    blur: () => textbox.focus.fire(false),
    select: () => textbox.select.fire(),
    cursor: {
      start: () => textbox.cursor.start(),
      end: () => textbox.cursor.end(),
    },
  };

  /**
   * API
   */
  const api: t.CmdBarEventsDisposable = {
    instance: textbox.instance,
    $,
    dispose,
    dispose$,
    state,
    action,
    text,
    clone() {
      const clone = { ...api };
      delete (clone as any).dispose;
      return clone;
    },
  };
  return api;
}
