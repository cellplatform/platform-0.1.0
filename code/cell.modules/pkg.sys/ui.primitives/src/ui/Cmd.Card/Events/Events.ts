import { filter, takeUntil, map } from 'rxjs/operators';

import { rx, t, Json, Util } from '../common';

type O = Record<string, unknown>;
type S = t.CmdCardState;

export type CmdCardEventsArgs<A extends O, B extends O> = {
  instance: t.CmdCardInstance;
  dispose$?: t.Observable<any>;
  initial?: t.CmdCardState<A, B> | (() => t.CmdCardState<A, B>);
};

/**
 * Event API
 */
export function CmdCardEvents<A extends O = any, B extends O = any>(args: CmdCardEventsArgs<A, B>) {
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
  const api: t.CmdCardEvents = {
    instance: events.instance,
    $,
    dispose,
    dispose$,
    state,
    state$,
  };
  return api;
}
