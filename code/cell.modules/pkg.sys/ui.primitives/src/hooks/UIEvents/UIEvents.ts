import { animationFrameScheduler, Subject, Observable } from 'rxjs';
import { filter, observeOn, takeUntil } from 'rxjs/operators';

import { rx, t } from '../common';

type Id = string;
type O = Record<string, unknown>;

/**
 * Event API.
 */

export function UIEvents<Ctx extends O = O>(args: {
  bus: t.EventBus<any>;
  instance: Id;
  dispose$?: Observable<any>;
  filter?: (e: t.UIEvent<Ctx>) => boolean;
}): t.UIEvents<Ctx> {
  const { instance } = args;
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = rx.busAsType<t.UIEvent>(args.bus);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.ui.event/')),
    filter((e) => e.payload.instance === instance),
    filter((e) => (args.filter ? args.filter(e as t.UIEvent<Ctx>) : true)),
    observeOn(animationFrameScheduler),
  );

  const mouse: t.UIEvents<Ctx>['mouse'] = {
    $: rx.payload<t.UIMouseEvent<Ctx>>($, 'sys.ui.event/Mouse'),
  };

  const touch: t.UIEvents<Ctx>['touch'] = {
    $: rx.payload<t.UITouchEvent<Ctx>>($, 'sys.ui.event/Touch'),
  };

  const focus: t.UIEvents<Ctx>['focus'] = {
    $: rx.payload<t.UIFocusEvent<Ctx>>($, 'sys.ui.event/Focus'),
  };

  /**
   * API
   */
  args.dispose$?.subscribe(dispose);
  return { $, instance, dispose, dispose$, mouse, touch, focus };
}
