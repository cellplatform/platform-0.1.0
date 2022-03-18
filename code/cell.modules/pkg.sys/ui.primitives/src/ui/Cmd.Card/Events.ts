import { animationFrameScheduler, Subject } from 'rxjs';
import { filter, observeOn, takeUntil } from 'rxjs/operators';

import { rx, t } from './common';

/**
 * Event API
 */

export const CmdCardEvents: t.CmdCardEventsFactory = (args) => {
  const { instance } = args;
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = rx.busAsType<t.CmdCardEvent>(args.bus);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.ui.CmdCard/')),
    filter((e) => e.payload.instance === instance),
    observeOn(animationFrameScheduler),
  );

  /**
   * API
   */
  return {
    bus: rx.bus.instance(bus),
    instance,
    $,
    dispose,
    dispose$,
  };
};
