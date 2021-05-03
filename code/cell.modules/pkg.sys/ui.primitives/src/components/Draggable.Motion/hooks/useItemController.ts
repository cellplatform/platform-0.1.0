import { animate, MotionValue } from 'framer-motion';
import { useEffect } from 'react';
import { Observable, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

import { rx, t } from '../common';
import { Events } from '../Events';
import * as n from '../types';
import { ItemUtil } from '../util';

type PositionChange = { axis: 'x' | 'y'; value: number };
type ScaleChange = { value: number };

type DragMonitor = { isDragging: boolean; stop(): void };
type MouseMonitor = { isDown: boolean; isOver: boolean; stop(): void };

type MoveMonitor = { stop(): void };
type MoveMonitorHandler = (e: MoveMonitorHandlerArgs) => void;
type MoveMonitorHandlerArgs = { stop(): void; isDrag: boolean };

type ScaleMonitor = { stop(): void };
type ScaleMonitorHandler = (e: ScaleMonitorHandlerArgs) => void;
type ScaleMonitorHandlerArgs = { stop(): void };

/**
 * Monitors requests for an items current status.
 */
export function useItemController(args: {
  bus: t.EventBus<any>;
  item: n.MotionDraggableItem;
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
}) {
  const { item, x, y, scale } = args;
  const bus = args.bus.type<n.MotionDraggableEvent>();

  useEffect(() => {
    const id = item.id;
    const events = Events(bus);
    const position$ = new Subject<PositionChange>();
    const scale$ = new Subject<ScaleChange>();

    const dragMonitor = Monitor.drag(events.$);
    const mouseMonitor = Monitor.mouse(events.$);

    x.onChange((value) => position$.next({ axis: 'x', value }));
    y.onChange((value) => position$.next({ axis: 'y', value }));
    scale.onChange((value) => scale$.next({ value }));

    const toStatus = (): n.MotionDraggableItemStatus => {
      const { width, height } = ItemUtil.toSize(item);
      const size = { width, height, scale: scale.get() };
      const position = { x: x.get(), y: y.get() };
      return { id, size, position };
    };

    /**
     * Fire [move] events.
     */
    const fireMove = (lifecycle: n.MotionDraggableItemMove['lifecycle'], isDrag: boolean) => {
      const status = toStatus();
      const via = isDrag ? 'drag' : 'code';
      bus.fire({
        type: 'ui/MotionDraggable/item/move',
        payload: { id, lifecycle, status, via },
      });
    };
    const moveMonitor = Monitor.move({
      position$,
      mouse: mouseMonitor,
      onStart: (e) => fireMove('start', e.isDrag),
      onComplete: (e) => fireMove('complete', e.isDrag),
    });

    /**
     * Fire [scale] events.
     */
    const fireScale = (lifecycle: n.MotionDraggableItemScale['lifecycle']) => {
      const status = toStatus();
      bus.fire({
        type: 'ui/MotionDraggable/item/scale',
        payload: { id, lifecycle, status },
      });
    };
    const scaleMonitor = Monitor.scale({
      scale$,
      onStart: (e) => fireScale('start'),
      onComplete: (e) => fireScale('complete'),
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
    events.item.change.req$
      .pipe(
        filter((e) => e.id === id),
        filter(
          (e) => typeof e.x === 'number' || typeof e.y === 'number' || typeof e.scale === 'number',
        ),
      )
      .subscribe(async (e) => {
        const { spring = {}, tx } = e;
        const stiffness = spring.stiffness ?? 100;
        const duration = spring.duration === undefined ? undefined : spring.duration / 1000; // NB: Convert from msecs => secs.

        const changePosition = (value: MotionValue<number>, to: number | undefined) => {
          return new Promise<void>((resolve) => {
            if (to === undefined) return resolve();
            const onComplete: MoveMonitorHandler = (monitor) => {
              monitor.stop();
              resolve();
            };
            Monitor.move({ position$, mouse: mouseMonitor, onComplete });
            animate(value, to, { ...spring, type: 'spring', stiffness, duration });
          });
        };

        const changeScale = (value: MotionValue<number>, to: number | undefined) => {
          return new Promise<void>((resolve) => {
            if (to === undefined) return resolve();
            const onComplete: ScaleMonitorHandler = (monitor) => {
              monitor.stop();
              resolve();
            };
            Monitor.scale({ scale$, onComplete });
            animate(value, to, { ...spring, type: 'spring', stiffness, duration });
          });
        };

        const before = toStatus();

        const wait: Promise<any>[] = [];
        if (before.position.x !== e.x) wait.push(changePosition(x, e.x));
        if (before.position.y !== e.y) wait.push(changePosition(y, e.y));
        if (before.size.scale !== e.scale) wait.push(changeScale(scale, e.scale));

        await Promise.all(wait);

        const status = toStatus();
        const target = { x: e.x, y: e.y, scale: e.scale };
        let interrupted = false;
        if (e.x !== undefined && status.position.x !== e.x) interrupted = true;
        if (e.y !== undefined && status.position.y !== e.y) interrupted = true;
        if (e.scale !== undefined && status.size.scale !== e.scale) interrupted = true;
        bus.fire({
          type: 'ui/MotionDraggable/item/change:res',
          payload: { tx, id, status, target, interrupted },
        });
      });

    /**
     * Dispose.
     */
    return () => {
      moveMonitor.stop();
      scaleMonitor.stop();
      dragMonitor.stop();
      mouseMonitor.stop();
      events.dispose();
    };
  }, [x, y, bus, item, scale]);
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
    position$: Observable<PositionChange>;
    mouse: MouseMonitor;
    onStart?: MoveMonitorHandler;
    onComplete?: MoveMonitorHandler;
  }): MoveMonitor {
    const { position$, mouse, onStart, onComplete } = args;
    const stop$ = new Subject<void>();
    const stop = () => stop$.next();

    let isMoving = false;
    position$
      .pipe(
        takeUntil(stop$),
        filter(() => !isMoving),
      )
      .subscribe((e) => {
        isMoving = true;

        const args: MoveMonitorHandlerArgs = { isDrag: mouse.isDown, stop };
        onStart?.(args);

        const complete$ = new Subject<void>();
        position$.pipe(takeUntil(stop$), takeUntil(complete$), debounceTime(50)).subscribe((e) => {
          isMoving = false;
          complete$.next();
          onComplete?.(args);
        });
      });

    return { stop };
  },

  scale(args: {
    scale$: Observable<ScaleChange>;
    onStart?: ScaleMonitorHandler;
    onComplete?: ScaleMonitorHandler;
  }): ScaleMonitor {
    const { scale$: position$, onStart, onComplete } = args;
    const stop$ = new Subject<void>();
    const stop = () => stop$.next();

    let isScaling = false;
    position$
      .pipe(
        takeUntil(stop$),
        filter(() => !isScaling),
      )
      .subscribe((e) => {
        isScaling = true;

        const args: ScaleMonitorHandlerArgs = { stop };
        onStart?.(args);

        const complete$ = new Subject<void>();
        position$.pipe(takeUntil(stop$), takeUntil(complete$), debounceTime(50)).subscribe((e) => {
          isScaling = false;
          complete$.next();
          onComplete?.(args);
        });
      });

    return { stop };
  },
};
