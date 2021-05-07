import { animate, MotionValue } from 'framer-motion';
import { Observable, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

import { rx, t } from './common';
import { Events } from './Events';
import * as n from './types';

type N = MotionValue<number>;

type DragMonitor = { isDragging: boolean; stop(): void };
type MouseMonitor = { isDown: boolean; isOver: boolean; stop(): void };

type MoveMonitor = { stop(): void };
type MoveMonitorHandler = (e: MoveMonitorHandlerArgs) => void;
type MoveMonitorHandlerArgs = { stop(): void; isDrag: boolean };

type ScaleMonitor = { stop(): void };
type ScaleMonitorHandler = (e: ScaleMonitorHandlerArgs) => void;
type ScaleMonitorHandlerArgs = { stop(): void };

/**
 * Controller logic.
 */
export function Controller(args: {
  bus: t.EventBus<any>;
  state: n.MotionDraggableItem;
  motion: { x: N; y: N; width: N; height: N; scale: N };
}) {
  const { state, motion } = args;
  const bus = args.bus.type<n.MotionDraggableEvent>();
  const changed$ = state.changed$;

  const id = state.id;
  const events = Events(bus);
  const dragMonitor = Monitor.drag(events.$);
  const mouseMonitor = Monitor.mouse(events.$);

  const changeRequest = {
    $: events.item.change.req$.pipe(filter((e) => e.id === id)),
    count: 0,
    get isChanging() {
      return changeRequest.count > 0;
    },
  };

  /**
   * Fire [move] events.
   */
  const fireMove = (lifecycle: n.MotionDraggableItemMove['lifecycle']) => {
    const status = state.current;
    const via = changeRequest.isChanging ? 'code/req' : 'drag';
    bus.fire({
      type: 'ui/MotionDraggable/item/move',
      payload: { id, lifecycle, status, via },
    });
  };
  const moveMonitor = Monitor.move({
    changed$,
    mouse: mouseMonitor,
    onStart: (e) => fireMove('start'),
    onComplete: (e) => fireMove('complete'),
  });

  /**
   * Fire [scale] events.
   */
  const fireScale = (lifecycle: n.MotionDraggableItemScale['lifecycle']) => {
    const status = state.current;
    const via = changeRequest.isChanging ? 'code/req' : 'wheel';
    bus.fire({
      type: 'ui/MotionDraggable/item/scale',
      payload: { id, lifecycle, status, via },
    });
  };
  const scaleMonitor = Monitor.scale({
    changed$,
    onStart: (e) => fireScale('start'),
    onComplete: (e) => fireScale('complete'),
  });

  /**
   * Retrieve item status.
   */
  events.item.status.req$.pipe(filter((e) => e.id === id)).subscribe((e) => {
    bus.fire({
      type: 'ui/MotionDraggable/item/status:res',
      payload: { tx: e.tx, status: state.current },
    });
  });

  /**
   * Change (move/scale) the item.
   */
  changeRequest.$.subscribe(async (e) => {
    const { spring = {}, tx } = e;
    const stiffness = spring.stiffness ?? 100;
    const duration = spring.duration === undefined ? undefined : spring.duration / 1000; // NB: Convert from msecs => secs.

    changeRequest.count++;

    const changePosition = (value: N, to?: number) => {
      return new Promise<void>((resolve) => {
        if (to === undefined) return resolve();
        const onComplete: MoveMonitorHandler = (monitor) => {
          monitor.stop();
          resolve();
        };
        Monitor.move({ changed$, mouse: mouseMonitor, onComplete });
        animate(value, to, { ...spring, type: 'spring', stiffness, duration });
      });
    };

    const changeScale = (value: N, to?: number) => {
      return new Promise<void>((resolve) => {
        if (to === undefined) return resolve();
        const onComplete: ScaleMonitorHandler = (monitor) => {
          monitor.stop();
          resolve();
        };
        Monitor.scale({ changed$, onComplete });
        animate(value, to, { ...spring, type: 'spring', stiffness, duration });
      });
    };

    const before = state.current;

    const wait: Promise<any>[] = [];
    if (before.position.x !== e.x) wait.push(changePosition(motion.x, e.x));
    if (before.position.y !== e.y) wait.push(changePosition(motion.y, e.y));
    if (before.size.scale !== e.scale) wait.push(changeScale(motion.scale, e.scale));

    await Promise.all(wait);

    const status = state.current;
    const target = { x: e.x, y: e.y, scale: e.scale };
    let interrupted = false;
    if (e.x !== undefined && status.position.x !== e.x) interrupted = true;
    if (e.y !== undefined && status.position.y !== e.y) interrupted = true;
    if (e.scale !== undefined && status.size.scale !== e.scale) interrupted = true;
    bus.fire({
      type: 'ui/MotionDraggable/item/change:res',
      payload: { tx, id, status, target, interrupted },
    });

    changeRequest.count--;
  });

  return {
    dispose() {
      moveMonitor.stop();
      scaleMonitor.stop();
      dragMonitor.stop();
      mouseMonitor.stop();
      events.dispose();
    },
  };
}

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
    changed$: Observable<n.MotionDraggableItemChange>;
    mouse: MouseMonitor;
    onStart?: MoveMonitorHandler;
    onComplete?: MoveMonitorHandler;
  }): MoveMonitor {
    const { mouse, onStart, onComplete } = args;
    const position$ = args.changed$.pipe(filter((e) => e.key === 'x' || e.key === 'y'));

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
    changed$: Observable<n.MotionDraggableItemChange>;
    onStart?: ScaleMonitorHandler;
    onComplete?: ScaleMonitorHandler;
  }): ScaleMonitor {
    const { onStart, onComplete } = args;
    const scale$ = args.changed$.pipe(filter((e) => e.key === 'scale'));

    const stop$ = new Subject<void>();
    const stop = () => stop$.next();

    let isScaling = false;
    scale$
      .pipe(
        takeUntil(stop$),
        filter(() => !isScaling),
      )
      .subscribe((e) => {
        isScaling = true;

        const args: ScaleMonitorHandlerArgs = { stop };
        onStart?.(args);

        const complete$ = new Subject<void>();
        scale$.pipe(takeUntil(stop$), takeUntil(complete$), debounceTime(50)).subscribe((e) => {
          isScaling = false;
          complete$.next();
          onComplete?.(args);
        });
      });

    return { stop };
  },
};
