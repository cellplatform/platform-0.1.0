import { t } from '../common';

/**
 * [Events]
 */
export type GridEvent =
  | t.EditorEvent
  | IGridReadyEvent
  | IGridRedrawEvent
  | IGridKeydownEvent
  | IGridChangeEvent
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
  type: 'GRID/changeSet';
  payload: IGridChangeSet;
};

export type IGridChangeEvent = {
  type: 'GRID/change';
  payload: IGridChange;
};

export type IGridChangeSet = { changes: IGridChange[]; cancel(): void };
export type IGridChange = {
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
