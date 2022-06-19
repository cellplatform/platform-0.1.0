import { filter, takeUntil } from 'rxjs/operators';

import { Json, rx, t, Util, CmdBar } from '../common';

type S = t.CmdCardState;

/**
 * Event API
 */
export function CmdCardEvents(args: t.CmdCardEventsArgs) {
  const { dispose, dispose$ } = rx.disposable(args.dispose$);

  const instance = args.instance.id;
  const bus = rx.busAsType<t.CmdCardEvent>(args.instance.bus);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.ui.CmdCard/')),
    filter((e) => e.payload.instance === instance),
  );

  const events = Json.Bus.Events({ instance: args.instance, dispose$ });
  const state = events.json<S>(args.initial ?? Util.state.default, { key: 'CmdCard' });
  const commandbar = CmdBar.Events({ instance: args.instance, dispose$ });

  /**
   * API
   */
  const api: t.CmdCardEventsDisposable = {
    instance: events.instance,
    $,
    dispose,
    dispose$,
    state,
    commandbar: {
      focus: commandbar.textbox.focus,
      blur: commandbar.textbox.blur,
      select: commandbar.textbox.select,
      cursor: commandbar.textbox.cursor,
      onExecuteCommand(fn) {
        commandbar.action.$.pipe(
          filter((e) => e.kind === 'Key:Enter'),
          filter((e) => Boolean(e.text)),
        ).subscribe((e) => {
          const trigger = e.kind;
          const text = state.current.commandbar.text ?? '';
          fn({ trigger, text });
        });
      },
    },
    clone() {
      return { ...api, dispose: undefined };
    },
  };
  return api;
}
