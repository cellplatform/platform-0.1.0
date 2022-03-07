import { animationFrameScheduler, Subject } from 'rxjs';
import { filter, observeOn, takeUntil } from 'rxjs/operators';

import { k, rx } from '../common';

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
    filter((e) => e.type.startsWith('sys.ui.List/')),
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

  const click: E['click'] = {
    $: rx.payload<k.ListClickEvent>($, 'sys.ui.List/Click'),
    fire(args) {
      const { index, item, mouse, button } = args;
      bus.fire({
        type: 'sys.ui.List/Click',
        payload: { instance, index, item, mouse, button },
      });
    },
  };

  const redraw: E['redraw'] = {
    $: rx.payload<k.ListRedrawEvent>($, 'sys.ui.List/Redraw'),
    fire() {
      bus.fire({ type: 'sys.ui.List/Redraw', payload: { instance } });
    },
  };

  return {
    instance,
    $,
    dispose,
    dispose$,
    scroll,
    click,
    redraw,
  };
};
