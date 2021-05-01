import { IDisposable } from '@platform/types';
import { Observable } from 'rxjs';

type M = MotionDraggableItem;
export type MotionDraggableItem = {
  width: number | ((e: M, index: number) => number);
  height: number | ((e: M, index: number) => number);
  el: JSX.Element | ((e: M, index: number) => JSX.Element);
};

export type MotionSpring = {
  stiffness?: number;
  duration?: number; // msecs
  damping?: number;
  mass?: number;
  bounce?: number;
  restSpeed?: number;
  restDelta?: number;
  velocity?: number;
};

export type MotionDraggableStatus = {
  size: { width: number; height: number };
  items: MotionDraggableItemStatus[];
};

export type MotionDraggableItemStatus = {
  index: number;
  size: { width: number; height: number };
  position: { x: number; y: number };
};

export type MotionDraggableEvents = IDisposable & {
  $: Observable<MotionDraggableEvent>;
  size: {
    req$: Observable<MotionDraggableSizeReq>;
    res$: Observable<MotionDraggableSizeRes>;
    get(): Promise<{ width: number; height: number }>;
  };
  status: {
    req$: Observable<MotionDraggableStatusReq>;
    res$: Observable<MotionDraggableStatusRes>;
    get(): Promise<MotionDraggableStatus>;
    item: {
      req$: Observable<MotionDraggableItemStatusReq>;
      res$: Observable<MotionDraggableItemStatusRes>;
      get(index: number): Promise<MotionDraggableItemStatus>;
    };
  };
  move: {
    item: {
      req$: Observable<MotionDraggableItemMoveReq>;
      res$: Observable<MotionDraggableItemMoveRes>;
      start(args: {
        index: number;
        x?: number;
        y?: number;
        spring?: MotionSpring;
      }): Promise<{
        status: MotionDraggableItemStatus;
        target: { x?: number; y?: number };
        interrupted: boolean; // true if the user grabbed the moving item during the animation and positioned it elsewhere.
      }>;
    };
  };
};

/**
 * Events
 */

export type MotionDraggableEvent =
  | MotionDraggableSizeReqEvent
  | MotionDraggableSizeResEvent
  | MotionDraggableStatusReqEvent
  | MotionDraggableStatusResEvent
  | MotionDraggableItemStatusReqEvent
  | MotionDraggableItemStatusResEvent
  | MotionDraggableItemMoveReqEvent
  | MotionDraggableItemMoveResEvent;

/**
 * Retrieve the current size of the container.
 */
export type MotionDraggableSizeReqEvent = {
  type: 'ui/MotionDraggable/size:req';
  payload: MotionDraggableSizeReq;
};
export type MotionDraggableSizeReq = { tx: string };

export type MotionDraggableSizeResEvent = {
  type: 'ui/MotionDraggable/size:res';
  payload: MotionDraggableSizeRes;
};
export type MotionDraggableSizeRes = { tx: string; width: number; height: number };

/**
 * Retieve the overall status.
 */
export type MotionDraggableStatusReqEvent = {
  type: 'ui/MotionDraggable/status:req';
  payload: MotionDraggableStatusReq;
};
export type MotionDraggableStatusReq = { tx: string };

export type MotionDraggableStatusResEvent = {
  type: 'ui/MotionDraggable/status:res';
  payload: MotionDraggableStatusRes;
};
export type MotionDraggableStatusRes = {
  tx: string;
  status: MotionDraggableStatus;
};

/**
 * Retieve the status of an individual item.
 */
export type MotionDraggableItemStatusReqEvent = {
  type: 'ui/MotionDraggable/item/status:req';
  payload: MotionDraggableItemStatusReq;
};
export type MotionDraggableItemStatusReq = { tx: string; index: number };

export type MotionDraggableItemStatusResEvent = {
  type: 'ui/MotionDraggable/item/status:res';
  payload: MotionDraggableItemStatusRes;
};
export type MotionDraggableItemStatusRes = {
  tx: string;
  status: MotionDraggableItemStatus;
};

/**
 * Cause one of more items to move.
 */
export type MotionDraggableItemMoveReqEvent = {
  type: 'ui/MotionDraggable/item/move:req';
  payload: MotionDraggableItemMoveReq;
};
export type MotionDraggableItemMoveReq = {
  tx: string;
  index: number;
  x?: number;
  y?: number;
  spring?: MotionSpring;
};

export type MotionDraggableItemMoveResEvent = {
  type: 'ui/MotionDraggable/item/move:res';
  payload: MotionDraggableItemMoveRes;
};
export type MotionDraggableItemMoveRes = {
  tx: string;
  status: MotionDraggableItemStatus;
  target: { x?: number; y?: number };
  interrupted: boolean; // true if the user grabbed the moving item during the animation and positioned it elsewhere.
};
