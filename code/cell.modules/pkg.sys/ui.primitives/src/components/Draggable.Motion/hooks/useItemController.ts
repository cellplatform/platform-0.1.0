import { animate, MotionValue } from 'framer-motion';
import { useEffect } from 'react';
import { Observable, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

import { rx, t } from '../common';
import { Events } from '../Events';
import * as n from '../types';
import { ItemUtil } from '../util';

type Change = { axis: 'x' | 'y'; value: number };
type DragMonitor = { isDragging: boolean; stop(): void };
type MouseMonitor = { isDown: boolean; isOver: boolean; stop(): void };
type MoveMonitor = { stop(): void };
type MoveMonitorHandler = (e: MoveMonitorHandlerArgs) => void;
type MoveMonitorHandlerArgs = { stop(): void; isDrag: boolean };

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
    const id = item.id;
    const events = Events(bus);
    const change$ = new Subject<Change>();

    const drag = Monitor.drag(events.$);
    const mouse = Monitor.mouse(events.$);

    x.onChange((value) => change$.next({ axis: 'x', value }));
    y.onChange((value) => change$.next({ axis: 'y', value }));

    const toStatus = (): n.MotionDraggableItemStatus => {
      const size = ItemUtil.toSize(item);
      const position = { x: x.get(), y: y.get() };
      return { id, size, position };
    };

    /**
     * Fire [move] events.
     */
    const fireMove = (lifecycle: n.MotionDraggableItemMove['lifecycle'], isDrag: boolean) => {
      const status = toStatus();
      const via = isDrag ? 'drag' : 'move';
      bus.fire({
        type: 'ui/MotionDraggable/item/move',
        payload: { id, lifecycle, status, via },
      });
    };
    const moveMonitor = Monitor.move({
      change$,
      mouse,
      onStart: (e) => fireMove('start', e.isDrag),
      onComplete: (e) => fireMove('complete', e.isDrag),
    });

    /**
     * Retrieve item status.
     */
    events.item.status.req$.pipe(filter((e) => e.id === id)).subscribe((e) => {
      bus.fire({
        type: 'ui/MotionDraggable/item/status:res',
        payload: { tx: e.tx, status: toStatus() },
      });
    });

    /**
     * Move the item.
     */
    events.item.move.req$
      .pipe(
        filter((e) => e.id === id),
        filter((e) => typeof e.x === 'number' || typeof e.y === 'number'),
      )
      .subscribe(async (e) => {
        const { spring = {}, tx } = e;
        const stiffness = spring.stiffness ?? 100;
        const duration = spring.duration === undefined ? undefined : spring.duration / 1000; // NB: Convert from msecs => secs.

        const move = (value: MotionValue<number>, to: number | undefined) => {
          return new Promise<void>((resolve) => {
            if (to === undefined) return resolve();

            const onComplete: MoveMonitorHandler = (monitor) => {
              monitor.stop();
              resolve();
            };

            Monitor.move({ change$, mouse, onComplete });

            animate(value, to, { ...spring, type: 'spring', stiffness, duration });
          });
        };

        const before = toStatus();

        if (before.position.x !== e.x && before.position.y !== e.y) {
          await Promise.all([move(x, e.x), move(y, e.y)]);
        }

        const status = toStatus();
        const target = { x: e.x, y: e.y };
        let interrupted = false;
        if (e.x !== undefined && status.position.x !== e.x) interrupted = true;
        if (e.y !== undefined && status.position.y !== e.y) interrupted = true;
        bus.fire({
          type: 'ui/MotionDraggable/item/move:res',
          payload: { tx, id, status, target, interrupted },
        });
      });

    /**
     * Dispose.
     */
    return () => {
      moveMonitor.stop();
      drag.stop();
      mouse.stop();
      events.dispose();
    };
  }, [x, y, bus, item]);
}

/**
 * [Helpers]
 */

const Monitor = {
  drag($: Observable<n.MotionDraggableEvent>): DragMonitor {
    const stop$ = new Subject<void>();
    rx.payload<n.MotionDraggableItemDragEvent>($, 'ui/MotionDraggable/item/drag')
      .pipe(takeUntil(stop$))
      .subscribe((e) => (res.isDragging = e.lifecycle === 'start'));
    const res = { isDragging: false, stop: () => stop$.next() };
    return res;
  },

  mouse($: Observable<n.MotionDraggableEvent>): MouseMonitor {
    const stop$ = new Subject<void>();
    rx.payload<n.MotionDraggableItemMouseEvent>($, 'ui/MotionDraggable/item/mouse')
      .pipe(takeUntil(stop$))
      .subscribe((e) => {
        if (e.mouse === 'down') res.isDown = true;
        if (e.mouse === 'up') res.isDown = false;
        if (e.mouse === 'enter') res.isOver = true;
        if (e.mouse === 'leave') res.isOver = false;
      });
    const res = { isDown: false, isOver: false, stop: () => stop$.next() };
    return res;
  },

  move(args: {
    change$: Observable<Change>;
    mouse: MouseMonitor;
    onStart?: MoveMonitorHandler;
    onComplete?: MoveMonitorHandler;
  }): MoveMonitor {
    const { change$, mouse, onStart, onComplete } = args;
    const stop$ = new Subject<void>();
    const stop = () => stop$.next();

    let isMoving = false;
    change$
      .pipe(
        takeUntil(stop$),
        filter(() => !isMoving),
      )
      .subscribe((e) => {
        isMoving = true;

        const args: MoveMonitorHandlerArgs = { isDrag: mouse.isDown, stop };
        onStart?.(args);

        const complete$ = new Subject<void>();
        change$.pipe(takeUntil(stop$), takeUntil(complete$), debounceTime(50)).subscribe((e) => {
          isMoving = false;
          complete$.next();
          onComplete?.(args);
        });
      });

    return { stop };
  },
};
