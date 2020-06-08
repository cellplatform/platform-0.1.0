/**
 * [Events]
 */

export type DragTargetEvent = IDragTargetChangeEvent;

export type IDragTargetChangeEvent = {
  type: 'cell.ui/DragTarget/change';
  payload: IDragTargetChange;
};

export type IDragTargetChange = {
  event: 'OVER' | 'LEAVE' | 'DROP';
  isDropped: boolean;
};
