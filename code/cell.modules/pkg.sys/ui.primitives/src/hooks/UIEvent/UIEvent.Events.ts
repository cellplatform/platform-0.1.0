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
  filter?: t.UIEventFilter<Ctx>;
}): t.UIEvents<Ctx> {
  const { instance } = args;
  const bus = rx.busAsType<t.UIEvent>(args.bus);

  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  args.dispose$?.subscribe(dispose);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.ui.event/')),
    filter((e) => e.payload.instance === instance),
    filter((e) => (args.filter ? args.filter(e as t.UIEvent<Ctx>) : true)),
    observeOn(animationFrameScheduler),
  );

  const mouse: t.UIEventsMouse<Ctx> = {
    $: rx.payload<t.UIMouseEvent<Ctx>>($, 'sys.ui.event/Mouse'),
    event: (name) => mouse.$.pipe(filter((e) => e.name === name)),
  };

  const touch: t.UIEventsTouch<Ctx> = {
    $: rx.payload<t.UITouchEvent<Ctx>>($, 'sys.ui.event/Touch'),
    event: (name) => touch.$.pipe(filter((e) => e.name === name)),
  };

  const focus: t.UIEventsFocus<Ctx> = {
    $: rx.payload<t.UIFocusEvent<Ctx>>($, 'sys.ui.event/Focus'),
    event: (name) => focus.$.pipe(filter((e) => e.name === name)),
  };

  /**
   * API
   */
  return {
    $,
    bus: rx.bus.instance(bus),
    instance,
    dispose,
    dispose$,
    mouse,
    touch,
    focus,
  };
}
