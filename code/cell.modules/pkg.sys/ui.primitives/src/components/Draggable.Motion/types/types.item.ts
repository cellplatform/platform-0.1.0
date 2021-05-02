type M = MotionDraggableItem;
export type MotionDraggableItem = {
  width: number | ((e: M, index: number) => number);
  height: number | ((e: M, index: number) => number);
  el: JSX.Element | ((e: M, index: number) => JSX.Element);
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
