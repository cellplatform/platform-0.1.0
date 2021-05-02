type M = MotionDraggableItem;
export type MotionDraggableItem = {
  id: string;
  width: number | ((e: M) => number);
  height: number | ((e: M) => number);
  el: JSX.Element | ((e: M) => JSX.Element);
  scaleable?: boolean | { min: number; max: number };
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
