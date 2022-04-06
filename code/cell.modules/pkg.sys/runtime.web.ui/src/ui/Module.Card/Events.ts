import { filter, takeUntil, map } from 'rxjs/operators';

import { rx, t, CmdCard, Json } from './common';

type S = t.CmdCardState;

/**
 * Event API
 */
export const ModuleCardEvents: t.ModuleCardEventsFactory = (args) => {
  const { dispose, dispose$ } = rx.disposable(args.dispose$);

  const instance = args.instance.id;
  const bus = rx.busAsType<t.ModuleCardEvent>(args.instance.bus);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.runtime.web/ModuleCard/')),
    filter((e) => e.payload.instance === instance),
  );

  // CmdCard
  const card = CmdCard.Events({ instance: args.instance, dispose$ });
  const data = Json.Bus.Events({ instance: args.instance, dispose$ });

  // const state = events.json<S>({ initial: args.initial ?? Util.defaultState });
  // const state$ = rx
  //   .payload<t.ModuleCardStateChangedEvent>($, 'sys.ui.ModuleCard/state:changed')
  //   .pipe(map((e) => e.state));

  /**
   * API
   */
  const api: t.ModuleCardEvents = {
    instance: card.instance,
    // $,
    dispose,
    dispose$,
    // state,
    // state$,
  };
  return api;
};
