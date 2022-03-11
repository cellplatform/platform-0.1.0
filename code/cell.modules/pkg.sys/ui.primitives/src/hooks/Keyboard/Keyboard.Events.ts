import { animationFrameScheduler, Observable, Subject } from 'rxjs';
import { filter, observeOn, takeUntil } from 'rxjs/operators';

import { rx, t } from '../common';
import { SINGLETON_INSTANCE } from './constants';

type Id = string;
type O = Record<string, unknown>;

/**
 * Event API.
 */

export function KeyboardEvents(args: {
  bus: t.EventBus<any>;
  instance?: Id;
  dispose$?: Observable<any>;
}): t.KeyboardEvents {
  const { instance = SINGLETON_INSTANCE } = args;
  const bus = rx.busAsType<t.KeyboardEvent>(args.bus);

  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  args.dispose$?.subscribe(dispose);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.ui.keyboard/')),
    filter((e) => e.payload.instance === instance),
    observeOn(animationFrameScheduler),
  );

  const key$ = rx.payload<t.KeyboardKeypressEvent>($, 'sys.ui.keyboard/keypress');
  const down$ = key$.pipe(filter((e) => e.is.down));
  const up$ = key$.pipe(filter((e) => e.is.up));

  /**
   * API
   */
  return { $, dispose, dispose$, key$, down$, up$ };
}
