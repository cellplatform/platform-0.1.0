import { animationFrameScheduler, Subject } from 'rxjs';
import { filter, observeOn, takeUntil } from 'rxjs/operators';

import { t, rx, Is, UIEvents } from './common';

/**
 * Types
 */
type O = Record<string, unknown>;
type E = t.ListEvents;

/**
 * Event (API)
 */
export const ListEvents: t.ListEventsFactory = (args) => {
  const { instance } = args;
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();
  const bus = rx.busAsType<t.ListEvent>(args.bus);

  const dom = <Ctx extends O>(filter: (ctx: Ctx) => boolean) => {
    return UIEvents<Ctx>({ bus, instance, dispose$, filter: (e) => filter(e.payload.ctx) });
  };
  const events = {
    list: dom<t.CtxList>((ctx) => ctx.kind === 'List'),
    item: dom<t.CtxItem>((ctx) => ctx.kind === 'Item'),
  };

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
      bus.fire({ type: 'sys.ui.List/Redraw', payload: { instance } });
    },
  };

  /**
   * API
   */
  return { instance, $, dispose, dispose$, scroll, redraw };
};
