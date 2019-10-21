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
  | IGridCellsChangeEvent
  | IGridColumnsChangeEvent
  | IGridRowsChangeEvent
  | IGridSelectionChangeEvent
  | IGridFocusEvent
  | IGridBlurEvent
  | IGridCommandEvent
  | IGridUndoEvent
  | IGridClipboardEvent
  | IGridClipboardBeforeReadEvent
  | IGridClipboardBeforePasteEvent;

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
export type GridCellChangeType =
  | 'EDIT'
  | 'DELETE'
  | 'CLIPBOARD/cut'
  | 'CLIPBOARD/paste'
  | 'PROPS/style';

export type IGridCellsChangeEvent = {
  type: 'GRID/cells/change';
  payload: IGridCellsChange;
};
export type IGridCellsChange = {
  source: GridCellChangeType;
  changes: t.IGridCellChange[];
  isCancelled: boolean;
  cancel(): void;
};

/**
 * Column.
 */
export type GridColumnChangeType = 'UPDATE' | 'RESET' | 'RESET/doubleClick' | 'CLIPBOARD/paste';

export type IGridColumnsChangeEvent = {
  type: 'GRID/columns/change';
  payload: IGridColumnsChange;
};
export type IGridColumnsChange = {
  from: t.IGridColumns;
  to: t.IGridColumns;
  changes: IGridColumnChange[];
};
export type IGridColumnChange = {
  column: string;
  source: t.GridColumnChangeType;
  from: t.IGridColumnData;
  to: t.IGridColumnData;
};

/**
 * Row.
 */
export type GridRowChangeType =
  | 'UPDATE'
  | 'UPDATE/cellEdited'
  | 'RESET'
  | 'RESET/doubleClick'
  | 'CLIPBOARD/paste';

export type IGridRowsChangeEvent = {
  type: 'GRID/rows/change';
  payload: IGridRowsChange;
};
export type IGridRowsChange = {
  from: t.IGridRows;
  to: t.IGridRows;
  changes: IGridRowChange[];
};
export type IGridRowChange = {
  row: number;
  source: t.GridRowChangeType;
  from: t.IGridRowData;
  to: t.IGridRowData;
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
 * Commands.
 */
export type IGridCommandEvent = {
  type: 'GRID/command';
  payload: t.IGridCommand;
};

/**
 * Clipboard.
 */
export type IGridClipboardEvent = {
  type: 'GRID/clipboard';
  payload: IGridClipboard;
};
export type IGridClipboard<A = t.GridClipboardCommand> = {
  action: A;
  selection: t.IGridSelection;
  text: string;
  cells: t.IGridCells;
  rows: t.IGridRows;
  columns: t.IGridColumns;
};

export type IGridClipboardBeforeReadEvent = {
  type: 'GRID/clipboard/before/read';
  payload: IGridClipboardBeforeRead;
};
export type IGridClipboardBeforeRead = {
  action: t.GridClipboardReadCommand;
  wait(promise: Promise<any>): void;
};

export type IGridClipboardBeforePasteEvent = {
  type: 'GRID/clipboard/before/paste';
  payload: IGridClipboardBeforePaste;
};
export type IGridClipboardBeforePaste = {
  text: string;
  pending?: IGridClipboard<t.GridClipboardReadCommand>;
  isModified: boolean;
  modify(change: IGridClipboard<t.GridClipboardReadCommand>): void;
};

/**
 * Undo/redo.
 */
export type IGridUndoEvent = {
  type: 'GRID/undo';
  payload: IGridUndo;
};
export type IGridUndo = {
  kind: 'UNDO' | 'REDO';
  changes: IGridUndoChange;
};
export type IGridUndoChange = {
  key: string;
  from?: t.CellValue;
  to?: t.CellValue;
};
