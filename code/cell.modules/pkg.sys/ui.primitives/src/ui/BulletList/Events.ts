import { animationFrameScheduler, Subject } from 'rxjs';
import { filter, observeOn, takeUntil } from 'rxjs/operators';

import { rx } from './common';
import * as k from './types';

type E = k.BulletListEvents;

/**
 * Event API
 */
export const BulletListEvents: k.BulletListEventsFactory = (args) => {
  const { instance } = args;
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = rx.busAsType<k.BulletListEvent>(args.bus);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => e.type.startsWith('sys.ui.BulletList/')),
    filter((e) => e.payload.instance === instance),
    observeOn(animationFrameScheduler),
  );

  const scroll: E['scroll'] = {
    $: rx.payload<k.BulletListScrollEvent>($, 'sys.ui.BulletList/Scroll'),
    fire(target, options = {}) {
      const { align } = options;
      bus.fire({
        type: 'sys.ui.BulletList/Scroll',
        payload: { instance, target, align },
      });
    },
  };

  const click: E['click'] = {
    $: rx.payload<k.BulletListClickEvent>($, 'sys.ui.BulletList/Click'),
    fire(args) {
      const { index, item, mouse, button } = args;
      bus.fire({
        type: 'sys.ui.BulletList/Click',
        payload: { instance, index, item, mouse, button },
      });
    },
  };

  const redraw: E['redraw'] = {
    $: rx.payload<k.BulletListRedrawEvent>($, 'sys.ui.BulletList/Redraw'),
    fire() {
      bus.fire({ type: 'sys.ui.BulletList/Redraw', payload: { instance } });
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
