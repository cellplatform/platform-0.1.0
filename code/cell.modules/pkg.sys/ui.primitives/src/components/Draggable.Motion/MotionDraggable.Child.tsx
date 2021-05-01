import { animate, DragElastic, m, MotionValue, useMotionValue } from 'framer-motion';
import React, { useEffect } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

import { t } from '../../common';
import { Events } from './Events';
import * as n from './types';

export type ChildProps = {
  bus: t.EventBus<any>;
  index: number;
  item: n.MotionDraggableItem;
  container: { width: number; height: number };
  elastic?: DragElastic;
};

export const Child: React.FC<ChildProps> = (props) => {
  const { container, item, index, elastic = 0.3 } = props;
  const { width, height } = toSize(item);
  const bus = props.bus.type<n.MotionDraggableEvent>();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const events = Events(bus);
    const changed$ = new Subject<{ axis: 'x' | 'y'; value: number }>();

    x.onChange((value) => changed$.next({ axis: 'x', value }));
    y.onChange((value) => changed$.next({ axis: 'y', value }));

    /**
     * Retrieve item status.
     */
    events.status.item.req$.pipe(filter((e) => e.index === index)).subscribe((e) => {
      const size = toSize(item);
      const position = { x: x.get(), y: y.get() };
      const status: n.MotionDraggableItemStatus = { index, size, position };
      bus.fire({ type: 'ui/MotionDraggable/item/status:res', payload: { tx: e.tx, status } });
    });

    /**
     * Move the item.
     */
    events.move.item.req$
      .pipe(
        filter((e) => e.index === index),
        filter((e) => typeof e.x === 'number' || typeof e.y === 'number'),
      )
      .subscribe(async (e) => {
        const { spring = {}, tx } = e;
        const stiffness = spring.stiffness ?? 100;

        const move = (value: MotionValue<number>, to: number | undefined) => {
          return new Promise<void>((resolve) => {
            if (to === undefined) return resolve();
            const done$ = new Subject<void>();
            changed$.pipe(takeUntil(done$), debounceTime(50)).subscribe(() => {
              done$.next();
              resolve();
            });
            animate(value, to, { ...spring, type: 'spring', stiffness });
          });
        };

        const before = await events.status.item.get(index);

        if (before.position.x !== e.x && before.position.y !== e.y) {
          await Promise.all([move(x, e.x), move(y, e.y)]);
        }

        const status = await events.status.item.get(index);
        const target = { x: e.x, y: e.y };
        let interrupted = false;
        if (e.x !== undefined && status.position.x !== e.x) interrupted = true;
        if (e.y !== undefined && status.position.y !== e.y) interrupted = true;
        bus.fire({
          type: 'ui/MotionDraggable/item/move:res',
          payload: { tx, status, target, interrupted },
        });
      });

    return () => events.dispose();
  }, []); // eslint-disable-line

  const constraints = {
    top: 0,
    left: 0,
    right: container.width - width,
    bottom: container.height - height,
  };

  const styles = {
    draggable: {
      x,
      y,
      width,
      height,
      pointerEvents: 'auto',
      display: 'flex',
      boxSizing: 'border-box',
    },
  };

  return (
    <m.div
      drag={true}
      dragElastic={elastic}
      dragMomentum={true}
      dragConstraints={constraints}
      style={styles.draggable as any}
    >
      {typeof item.el === 'function' ? item.el(item, index) : item.el}
    </m.div>
  );
};

/**
 * [Helpers]
 */

function toSize(item: n.MotionDraggableItem) {
  const width = typeof item.width === 'function' ? item.width() : item.width;
  const height = typeof item.height === 'function' ? item.height() : item.height;
  return { width, height };
}
