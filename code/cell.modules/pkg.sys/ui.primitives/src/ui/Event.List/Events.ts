import { filter, takeUntil } from 'rxjs/operators';
import { ListEvents } from '../List/Events';

import { rx, t } from './common';

type E = t.EventListEvents;

/**
 * Event API
 */
export const EventListEvents: t.EventListEventsFactory = (args) => {
  const instance = args.instance.id;
  const { dispose, dispose$ } = rx.disposable();

  const bus = rx.busAsType<t.EventListEvent>(args.instance.bus);
  const list = ListEvents({ instance: args.instance, dispose$ });

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.ui.EventList/')),
    filter((e) => e.payload.instance === instance),
  );

  const click: E['click'] = {
    $: rx.payload<t.EventListClickedEvent>($, 'sys.ui.EventList/Clicked'),
    fire(args) {
      const { index, item } = args;
      bus.fire({
        type: 'sys.ui.EventList/Clicked',
        payload: { instance, index, item },
      });
    },
  };

  const redraw: E['redraw'] = () => list.redraw.fire();
  const scroll: E['scroll'] = (target, options) => list.scroll.fire(target, options);

  /**
   * API
   */
  return {
    instance: { bus: rx.bus.instance(bus), id: instance },
    $,
    dispose,
    dispose$,
    click,
    scroll,
    redraw,
  };
};
