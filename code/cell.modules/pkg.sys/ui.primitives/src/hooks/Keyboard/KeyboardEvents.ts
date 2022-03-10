import { animationFrameScheduler, Subject, Observable } from 'rxjs';
import { filter, observeOn, takeUntil } from 'rxjs/operators';

import { rx, t } from '../common';

type Id = string;
type O = Record<string, unknown>;

/**
 * Event API.
 */

export function KeyboardEvents(args: {
  bus: t.EventBus<any>;
  dispose$?: Observable<any>;
}): t.KeyboardEvents {
  const bus = rx.busAsType<t.KeyboardEvent>(args.bus);

  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  args.dispose$?.subscribe(dispose);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.ui.keyboard/')),
    observeOn(animationFrameScheduler),
  );

  const keydown$ = $.pipe(filter((e) => e.payload.is.down));
  const keyup$ = $.pipe(filter((e) => e.payload.is.down));

  /**
   * API
   */
  return { $, dispose, dispose$, down$: keydown$, up$: keyup$ };
}
