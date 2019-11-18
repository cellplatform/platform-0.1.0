export type DragPosition = { x: number; y: number };

export type IDragPositionEvent = {
  type: 'DRAG' | 'COMPLETE';
  client: DragPosition;
  screen: DragPosition;
  element: DragPosition;
  delta: DragPosition;
  start: DragPosition;
};
