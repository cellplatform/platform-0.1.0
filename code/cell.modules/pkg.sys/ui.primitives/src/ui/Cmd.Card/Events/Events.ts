import { filter, takeUntil, map } from 'rxjs/operators';

import { rx, t, Json, Util } from '../common';

type S = t.CmdCardState;

/**
 * Event API
 */
export const CmdCardEvents: t.CmdCardEventsFactory = (args) => {
  const { dispose, dispose$ } = rx.disposable(args.dispose$);

  const instance = args.instance.id;
  const bus = rx.busAsType<t.CmdCardEvent>(args.instance.bus);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.ui.CmdCard/')),
    filter((e) => e.payload.instance === instance),
  );

  const events = Json.Bus.Events({ instance: args.instance, dispose$ });
  const state = events.json<S>({ initial: args.initial ?? Util.defaultState });
  const state$ = rx
    .payload<t.CmdCardStateChangedEvent>($, 'sys.ui.CmdCard/state:changed')
    .pipe(map((e) => e.state));

  /**
   * API
   */
  const api: t.CmdCardEventsDisposable = {
    instance: events.instance,
    $,
    dispose,
    dispose$,
    state,
    state$,
  };
  return api;
};
