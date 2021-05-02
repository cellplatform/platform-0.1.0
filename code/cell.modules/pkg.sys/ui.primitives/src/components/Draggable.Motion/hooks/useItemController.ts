import { animate, MotionValue } from 'framer-motion';
import { useEffect } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

import { t } from '../common';
import { Events } from '../Events';
import * as n from '../types';
import { ItemUtil } from '../util';

/**
 * Monitors requests for an items current status.
 */
export function useItemController(args: {
  bus: t.EventBus<any>;
  item: n.MotionDraggableItem;
  x: MotionValue<number>;
  y: MotionValue<number>;
}) {
  const { x, y, item } = args;
  const bus = args.bus.type<n.MotionDraggableEvent>();

  useEffect(() => {
    const events = Events(bus);
    const changed$ = new Subject<{ axis: 'x' | 'y'; value: number }>();

    x.onChange((value) => changed$.next({ axis: 'x', value }));
    y.onChange((value) => changed$.next({ axis: 'y', value }));

    /**
     * Retrieve item status.
     */
    events.status.item.req$.pipe(filter((e) => e.id === item.id)).subscribe((e) => {
      const id = item.id;
      const size = ItemUtil.toSize(item);
      const position = { x: x.get(), y: y.get() };
      const status: n.MotionDraggableItemStatus = { id, size, position };
      bus.fire({ type: 'ui/MotionDraggable/item/status:res', payload: { tx: e.tx, status } });
    });

    /**
     * Move the item.
     */
    events.move.item.req$
      .pipe(
        filter((e) => e.id === item.id),
        filter((e) => typeof e.x === 'number' || typeof e.y === 'number'),
      )
      .subscribe(async (e) => {
        const { spring = {}, tx } = e;
        const stiffness = spring.stiffness ?? 100;
        const duration = spring.duration === undefined ? undefined : spring.duration / 1000; // NB: Convert from msecs => secs.

        const move = (value: MotionValue<number>, to: number | undefined) => {
          return new Promise<void>((resolve) => {
            if (to === undefined) return resolve();
            const done$ = new Subject<void>();
            changed$.pipe(takeUntil(done$), debounceTime(30)).subscribe(() => {
              done$.next();
              resolve();
            });
            animate(value, to, { ...spring, type: 'spring', stiffness, duration });
          });
        };

        const before = await events.status.item.get(item.id);

        if (before.position.x !== e.x && before.position.y !== e.y) {
          await Promise.all([move(x, e.x), move(y, e.y)]);
        }

        const status = await events.status.item.get(item.id);
        const target = { x: e.x, y: e.y };
        let interrupted = false;
        if (e.x !== undefined && status.position.x !== e.x) interrupted = true;
        if (e.y !== undefined && status.position.y !== e.y) interrupted = true;
        bus.fire({
          type: 'ui/MotionDraggable/item/move:res',
          payload: { tx, status, target, interrupted },
        });
      });

    /**
     * Dispose
     */
    return () => events.dispose();
  }, [x, y, bus, item]);
}
