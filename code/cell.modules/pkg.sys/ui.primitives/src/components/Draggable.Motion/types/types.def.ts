import { MotionDraggableItem } from './types.status';

type D = MotionDraggableDef;

export type MotionDraggableDef = {
  id: string;
  width: number | (() => number);
  height: number | (() => number);
  el: JSX.Element | MotionDraggableRender;
  scaleable?: boolean | { min: number; max: number };
};

export type MotionDraggableRender = (state: MotionDraggableItem) => JSX.Element;

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
