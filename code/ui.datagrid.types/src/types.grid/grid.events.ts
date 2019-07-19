import { MouseEvent, MouseEventType } from '@platform/react/lib/types';
import { t } from '../common';

/**
 * [Events]
 */
export type GridEvent =
  | t.EditorEvent
  | IGridReadyEvent
  | IGridRedrawEvent
  | IGridKeydownEvent
  | IGridMouseEvent
  | IGridCellChangeEvent
  | IGridChangeSetEvent
  | IColumnsChangedEvent
  | IRowsChangedEvent
  | IGridSelectionChangeEvent
  | IGridFocusEvent
  | IGridBlurEvent
  | IGridClipboardEvent;

export type IGridReadyEvent = {
  type: 'GRID/ready';
  payload: { grid: t.IGrid };
};

export type IGridRedrawEvent = {
  type: 'GRID/redraw';
  payload: {};
};

/**
 * Keyboard.
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
  isCancelled: boolean;
  cancel: () => void;
};

/**
 * Mouse.
 */
export type IGridMouseEvent = {
  type: 'GRID/mouse';
  payload: IGridMouse;
};

export type IGridMouse = MouseEvent & {
  cell: t.GridCellKey;
  cellType: t.GridCellType;
  type: MouseEventType;
  grid: t.IGrid;
  isCancelled: boolean;
  cancel: () => void;
};

/**
 * Cell.
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
 * Column.
 */
export type IColumnsChangedEvent = {
  type: 'GRID/columns/changed';
  payload: IColumnsChanged;
};
export type IColumnsChanged = {
  from: t.IGridColumns;
  to: t.IGridColumns;
  changes: IColumnChange[];
};
export type IColumnChange = {
  column: string;
  type: 'UPDATE' | 'RESET' | 'RESET/doubleClick';
  from: t.IGridColumn;
  to: t.IGridColumn;
};

/**
 * Rows.
 */
export type IRowsChangedEvent = {
  type: 'GRID/rows/changed';
  payload: IRowsChanged;
};
export type IRowsChanged = {
  from: t.IGridRows;
  to: t.IGridRows;
  changes: IRowChange[];
};
export type IRowChange = {
  row: number;
  type: 'UPDATE' | 'UPDATE/cellEdited' | 'RESET' | 'RESET/doubleClick';
  from: t.IGridRow;
  to: t.IGridRow;
};

/**
 * Selection.
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
 * Focus.
 */
export type IGridFocusEvent = {
  type: 'GRID/focus';
  payload: { grid: t.IGrid };
};
export type IGridBlurEvent = {
  type: 'GRID/blur';
  payload: { grid: t.IGrid };
};

/**
 * Clipboard.
 */
export type IGridClipboardEvent = {
  type: 'GRID/clipboard';
  payload: IGridClipboard;
};
export type IGridClipboard = {
  action: 'COPY' | 'CUT' | 'PASTE';
  grid: t.IGrid;
  selection: t.IGridSelection;
};
