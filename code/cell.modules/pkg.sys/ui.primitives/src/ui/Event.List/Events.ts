import { animationFrameScheduler, Subject } from 'rxjs';
import { filter, observeOn, takeUntil } from 'rxjs/operators';

import { rx, t } from './common';

/**
 * Event API
 */
export const EventListEvents: t.EventListEventsFactory = (args) => {
  const { instance } = args;
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = rx.busAsType<t.EventListEvent>(args.bus);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.ui.EventList/')),
    filter((e) => e.payload.instance === instance),
    observeOn(animationFrameScheduler),
  );

  const scroll: t.EventListEvents['scroll'] = {
    $: rx.payload<t.EventListScrollEvent>($, 'sys.ui.EventList/Scroll'),
    fire(target, options = {}) {
      const { align } = options;
      bus.fire({
        type: 'sys.ui.EventList/Scroll',
        payload: { instance, target, align },
      });
    },
  };

  const click: t.EventListEvents['click'] = {
    $: rx.payload<t.EventListClickedEvent>($, 'sys.ui.EventList/Clicked'),
    fire(args) {
      const { index, item } = args;
      bus.fire({
        type: 'sys.ui.EventList/Clicked',
        payload: { instance, index, item },
      });
    },
  };

  /**
   * API
   */
  return {
    bus: rx.bus.instance(bus),
    instance,
    $,
    dispose,
    dispose$,
    scroll,
    click,
  };
};
