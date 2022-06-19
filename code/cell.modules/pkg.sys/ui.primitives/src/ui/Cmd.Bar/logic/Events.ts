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
  const input = TextInput.Events({ instance: args.instance, dispose$ });

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

  const textbox: t.CmdBarEvents['textbox'] = {
    focus: () => input.focus.fire(true),
    blur: () => input.focus.fire(false),
    select: () => input.select.fire(),
    cursor: {
      start: () => input.cursor.start(),
      end: () => input.cursor.end(),
    },
  };

  /**
   * API
   */
  const api: t.CmdBarEventsDisposable = {
    instance: input.instance,
    $,
    dispose,
    dispose$,
    state,
    action,
    textbox,
    clone() {
      const clone = { ...api };
      delete (clone as any).dispose;
      return clone;
    },
  };
  return api;
}
