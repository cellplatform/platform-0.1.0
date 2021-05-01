import { firstValueFrom, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { rx, slug, t } from '../../common';
import * as n from './types';

const Payload = rx.payload;

/**
 * Helpers for firing <MotionaDraggable> related events.
 */
export function Events(eventbus: t.EventBus<any>): n.MotionDraggableEvents {
  const dispose$ = new Subject<void>();
  const bus = eventbus.type<n.MotionDraggableEvent>();
  const $ = bus.event$.pipe(takeUntil(dispose$));

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
    item: {
      req$: Payload<n.MotionDraggableItemStatusReqEvent>($, 'ui/MotionDraggable/item/status:req'),
      res$: Payload<n.MotionDraggableItemStatusResEvent>($, 'ui/MotionDraggable/item/status:res'),
      async get(index: number) {
        const tx = slug();
        const res = firstValueFrom(
          status.item.res$.pipe(
            filter((e) => e.tx === tx),
            filter((e) => e.status.index === index),
          ),
        );
        bus.fire({ type: 'ui/MotionDraggable/item/status:req', payload: { tx, index } });
        return (await res).status;
      },
    },
    async get() {
      const tx = slug();
      const res = firstValueFrom(status.res$.pipe(filter((e) => e.tx === tx)));
      bus.fire({ type: 'ui/MotionDraggable/status:req', payload: { tx } });
      return (await res).status;
    },
  };

  const move: n.MotionDraggableEvents['move'] = {
    item: {
      req$: Payload<n.MotionDraggableItemMoveReqEvent>($, 'ui/MotionDraggable/item/move:req'),
      res$: Payload<n.MotionDraggableItemMoveResEvent>($, 'ui/MotionDraggable/item/move:res'),
      async start(args) {
        const { index, x, y, spring } = args;
        const tx = slug();
        const res = firstValueFrom(move.item.res$.pipe(filter((e) => e.tx === tx)));
        bus.fire({
          type: 'ui/MotionDraggable/item/move:req',
          payload: { tx, index, x, y, spring },
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
    move,
  };
}
