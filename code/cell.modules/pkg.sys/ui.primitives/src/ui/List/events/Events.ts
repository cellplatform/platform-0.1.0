import { animationFrameScheduler, Subject } from 'rxjs';
import { filter, observeOn, takeUntil } from 'rxjs/operators';

import { k, rx, Is } from '../common';

type E = k.ListEvents;

/**
 * Event API
 */
export const ListEvents: k.ListEventsFactory = (args) => {
  const { instance } = args;
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = rx.busAsType<k.ListEvent>(args.bus);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => Is.listEvent(e)),
    filter((e) => e.payload.instance === instance),
    observeOn(animationFrameScheduler),
  );

  const scroll: E['scroll'] = {
    $: rx.payload<k.ListScrollEvent>($, 'sys.ui.List/Scroll'),
    fire(target, options = {}) {
      const { align } = options;
      bus.fire({
        type: 'sys.ui.List/Scroll',
        payload: { instance, target, align },
      });
    },
  };

  const redraw: E['redraw'] = {
    $: rx.payload<k.ListRedrawEvent>($, 'sys.ui.List/Redraw'),
    fire() {
      bus.fire({ type: 'sys.ui.List/Redraw', payload: { instance } });
    },
  };

  const item: E['item'] = {
    click: {
      $: rx.payload<k.ListItemClickEvent>($, 'sys.ui.List/Item/Click'),
      fire(args) {
        const { index, item, mouse, button } = args;
        bus.fire({
          type: 'sys.ui.List/Item/Click',
          payload: { instance, index, item, mouse, button },
        });
      },
    },
    hover: {
      $: rx.payload<k.ListItemHoverEvent>($, 'sys.ui.List/Item/Hover'),
      fire(args) {
        const { index, item, isOver, mouse } = args;
        bus.fire({
          type: 'sys.ui.List/Item/Hover',
          payload: { instance, index, item, isOver, mouse },
        });
      },
    },
  };

  /**
   * API
   */
  return { instance, $, dispose, dispose$, scroll, redraw, item };
};
