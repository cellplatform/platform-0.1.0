import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { rx, t, TextInput } from '../common';

type E = t.CmdBarEvents;

/**
 * Event API.
 */
export function CmdBarEvents(args: { instance: t.CmdBarInstance; dispose$?: t.Observable<any> }) {
  const dispose$ = new Subject<void>();
  const dispose = () => rx.done(dispose$);
  args.dispose$?.subscribe(dispose);

  const instance = args.instance.id;
  const bus = rx.busAsType<t.CmdBarEvent>(args.instance.bus);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.payload.instance === instance),
    filter((e) => e.type.startsWith('sys.ui.CmdBar/')),
  );

  const textbox = TextInput.Events({ instance: args.instance, dispose$ });

  const action: E['action'] = {
    $: rx.payload<t.CmdBarActionEvent>($, 'sys.ui.CmdBar/Action'),
    fire(args) {
      const { text, kind } = args;
      bus.fire({
        type: 'sys.ui.CmdBar/Action',
        payload: { instance, text, kind },
      });
    },
  };

  const text: E['text'] = {
    changed$: rx.payload<t.CmdBarTextChangeEvent>($, 'sys.ui.CmdBar/TextChanged'),
    change(args) {
      const { from, to } = args;
      bus.fire({
        type: 'sys.ui.CmdBar/TextChanged',
        payload: { instance, from, to },
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
