import { firstValueFrom, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { rx, slug, t } from './common';
import * as n from './types';

const Payload = rx.payload;

/**
 * Helpers for firing <MotionaDraggable> related events.
 */
export function Events(eventbus: t.EventBus<any>): n.MotionDraggableEvents {
  const dispose$ = new Subject<void>();
  const bus = eventbus as t.EventBus<n.MotionDraggableEvent>;
  const $ = bus.$.pipe(takeUntil(dispose$));

  const size = {
    req$: Payload<n.MotionDraggableSizeReqEvent>($, 'ui/MotionDraggable/size:req'),
    res$: Payload<n.MotionDraggableSizeResEvent>($, 'ui/MotionDraggable/size:res'),
    async get() {
      const tx = slug();
      const res = firstValueFrom(size.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({ type: 'ui/MotionDraggable/size:req', payload: { tx } });
      const { width, height } = await res;
      return { width, height };
    },
  };

  const status = {
    req$: Payload<n.MotionDraggableStatusReqEvent>($, 'ui/MotionDraggable/status:req'),
    res$: Payload<n.MotionDraggableStatusResEvent>($, 'ui/MotionDraggable/status:res'),
    async get() {
      const tx = slug();
      const res = firstValueFrom(status.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({ type: 'ui/MotionDraggable/status:req', payload: { tx } });
      return (await res).status;
    },
  };

  const item: n.MotionDraggableEvents['item'] = {
    move$: Payload<n.MotionDraggableItemMoveEvent>($, 'ui/MotionDraggable/item/move'),
    scale$: Payload<n.MotionDraggableItemScaleEvent>($, 'ui/MotionDraggable/item/scale'),

    status: {
      req$: Payload<n.MotionDraggableItemStatusReqEvent>($, 'ui/MotionDraggable/item/status:req'),
      res$: Payload<n.MotionDraggableItemStatusResEvent>($, 'ui/MotionDraggable/item/status:res'),
      async get(id: string) {
        const tx = slug();
        const res = firstValueFrom(
          item.status.res$.pipe(
            filter((e) => e.tx === tx),
            filter((e) => e.status.id === id),
          ),
        );
        bus.fire({ type: 'ui/MotionDraggable/item/status:req', payload: { tx, id } });
        return (await res).status;
      },
    },

    change: {
      req$: Payload<n.MotionDraggableItemChangeReqEvent>($, 'ui/MotionDraggable/item/change:req'),
      res$: Payload<n.MotionDraggableItemChangeResEvent>($, 'ui/MotionDraggable/item/change:res'),

      async start(args) {
        const { id, x, y, scale, spring } = args;
        const tx = slug();
        const res = firstValueFrom(item.change.res$.pipe(filter((e) => e.tx === tx)));
        bus.fire({
          type: 'ui/MotionDraggable/item/change:req',
          payload: { tx, id, x, y, scale, spring },
        });
        const { status, target, interrupted } = await res;
        return { status, target, interrupted };
      },
    },
  };

  return {
    $,
    dispose$: dispose$.asObservable(),
    dispose: () => dispose$.next(),
    size,
    status,
    item,
  };
}
