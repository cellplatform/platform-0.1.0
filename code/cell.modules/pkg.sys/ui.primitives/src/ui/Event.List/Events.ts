import { animationFrameScheduler, Subject } from 'rxjs';
import { filter, observeOn, takeUntil } from 'rxjs/operators';

import { rx } from './common';
import * as k from './types';

/**
 * Event API
 */
export const EventListEvents: k.EventListEventsFactory = (args) => {
  const { instance } = args;
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = rx.busAsType<k.EventListEvent>(args.bus);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.ui.EventList/')),
    filter((e) => e.payload.instance === instance),
    observeOn(animationFrameScheduler),
  );

  const scroll: k.EventListEvents['scroll'] = {
    $: rx.payload<k.EventListScrollEvent>($, 'sys.ui.EventList/Scroll'),
    fire(target, options = {}) {
      const { align } = options;
      bus.fire({
        type: 'sys.ui.EventList/Scroll',
        payload: { instance, target, align },
      });
    },
  };

  const click: k.EventListEvents['click'] = {
    $: rx.payload<k.EventListClickedEvent>($, 'sys.ui.EventList/Clicked'),
    fire(args) {
      const { index, item } = args;
      bus.fire({
        type: 'sys.ui.EventList/Clicked',
        payload: { instance, index, item },
      });
    },
  };

  return { instance, $, dispose, dispose$, scroll, click };
};
