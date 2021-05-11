import { MotionDraggableItem } from './types.status';

export type MotionDraggableDef = {
  id: string;
  width: number | (() => number);
  height: number | (() => number);
  el: JSX.Element | MotionDraggableRender;
  scaleable?: boolean | { min: number; max: number };
};

export type MotionDraggableRender = (state: MotionDraggableItem) => JSX.Element;
