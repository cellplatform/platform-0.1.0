import { Observable, EventBus } from './common';
import { MotionDraggableEvent } from './types.events';

export type MotionDraggableStatus = {
  size: { width: number; height: number };
  items: MotionDraggableItemStatus[];
};

export type MotionDraggableItemStatus = {
  id: string;
  size: { width: number; height: number; scale: number };
  position: { x: number; y: number };
};

export type MotionDraggableItem = {
  id: string;
  bus: EventBus<MotionDraggableEvent>;
  current: MotionDraggableItemStatus;
  changed$: Observable<MotionDraggableItemChange>;
};

export type MotionDraggableItemChange = {
  key: 'x' | 'y' | 'scale' | 'width' | 'height';
  value: number;
};
