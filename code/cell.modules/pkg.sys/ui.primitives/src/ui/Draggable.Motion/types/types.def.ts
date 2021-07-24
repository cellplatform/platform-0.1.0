import { MotionDraggableItem } from './types.status';

export type MotionDraggableDef = {
  id: string;
  width: number | (() => number);
  height: number | (() => number);
  el: JSX.Element | MotionDraggableRender;
  scaleable?: boolean | { min: number; max: number };
};

export type MotionDraggableRender = (props: MotionDraggableRenderProps) => JSX.Element;

export type MotionDraggableRenderProps = {
  state: MotionDraggableItem;
  container: MotionDraggableContainer;
};

export type MotionDraggableSize = { width: number; height: number };
export type MotionDraggableContainer = { size: MotionDraggableSize };
