import { animationFrameScheduler, Subject } from 'rxjs';
import { filter, observeOn, takeUntil } from 'rxjs/operators';

import { t, rx, Is } from './common';

/**
 * Types
 */
type Index = number;
type E = t.ListEvents;

/**
 * Event (API)
 */
export const ListEvents: t.ListEventsFactory = (args) => {
  const { instance } = args;
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = rx.busAsType<t.ListEvent>(args.bus);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => Is.listEvent(e)),
    filter((e) => e.payload.instance === instance),
    observeOn(animationFrameScheduler),
  );

  const scroll: E['scroll'] = {
    $: rx.payload<t.ListScrollEvent>($, 'sys.ui.List/Scroll'),
    fire(target, options = {}) {
      const { align } = options;
      bus.fire({
        type: 'sys.ui.List/Scroll',
        payload: { instance, target, align },
      });
    },
  };

  const redraw: E['redraw'] = {
    $: rx.payload<t.ListRedrawEvent>($, 'sys.ui.List/Redraw'),
    fire() {
      bus.fire({
        type: 'sys.ui.List/Redraw',
        payload: { instance },
      });
    },
  };

  const item: E['item'] = (index: Index) => {
    return {
      changed: {
        $: rx
          .payload<t.ListItemChangedEvent>($, 'sys.ui.List/Item/Changed')
          .pipe(filter((e) => e.index === index)),
      },
    };
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
    redraw,
    item,
  };
};
