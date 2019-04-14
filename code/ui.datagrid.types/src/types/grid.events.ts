import { t } from '../common';

/**
 * [Events]
 */
export type GridEvent =
  | t.EditorEvent
  | IGridReadyEvent
  | IGridRedrawEvent
  | IGridKeydownEvent
  | IGridCellChangeEvent
  | IGridChangeSetEvent
  | IGridSelectionChangeEvent
  | IGridFocusEvent
  | IGridBlurEvent;

export type IGridReadyEvent = {
  type: 'GRID/ready';
  payload: { grid: t.IGrid };
};

export type IGridRedrawEvent = {
  type: 'GRID/redraw';
  payload: {};
};

/**
 * Keyboard
 */
export type IGridKeydownEvent = {
  type: 'GRID/keydown';
  payload: IGridKeydown;
};
export type IGridKeydown = {
  key: KeyboardEvent['key'];
  event: KeyboardEvent;
  grid: t.IGrid;
  isEnter: boolean;
  isEscape: boolean;
  isDelete: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  cancel: () => void;
};

/**
 * Change
 */
export type GridChangeType = 'EDIT' | 'OTHER';
export type IGridChangeSetEvent = {
  type: 'GRID/cell/change/set';
  payload: IGridCellChangeSet;
};

export type IGridCellChangeEvent = {
  type: 'GRID/cell/change';
  payload: IGridCellChange;
};

export type IGridCellChangeSet = { changes: IGridCellChange[]; cancel(): void };
export type IGridCellChange = {
  source: GridChangeType;
  grid: t.IGrid;
  cell: t.ICell;
  value: { from?: t.CellValue; to?: t.CellValue };
  isCancelled: boolean;
  isChanged: boolean;
  cancel(): void;
};

/**
 * Selection
 */
export type IGridSelectionChangeEvent = {
  type: 'GRID/selection';
  payload: IGridSelectionChange;
};
export type IGridSelectionChange = {
  grid: t.IGrid;
  from: t.IGridSelection;
  to: t.IGridSelection;
};

/**
 * Focus
 */
export type IGridFocusEvent = {
  type: 'GRID/focus';
  payload: { grid: t.IGrid };
};
export type IGridBlurEvent = {
  type: 'GRID/blur';
  payload: { grid: t.IGrid };
};
