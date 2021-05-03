export type MotionDraggableStatus = {
  size: { width: number; height: number };
  items: MotionDraggableItemStatus[];
};

export type MotionDraggableItemStatus = {
  id: string;
  size: { width: number; height: number; scale: number };
  position: { x: number; y: number };
};
