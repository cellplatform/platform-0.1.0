import { Grid, Cell } from '../../api';
import * as t from '../../types';

export type IGridSelection = {
  current?: t.GridCellKey;
  ranges: t.GridCellRangeKey[];
  all?: boolean;
};

export type IInitialGridState = {
  selection?: {
    cell: t.CellRef;
    ranges?: t.GridCellRangeKey[];
  };
};

/**
 * [Events]
 */
export type GridEvent =
  | t.EditorEvent
  | IGridReadyEvent
  | IGridKeydownEvent
  | IGridChangeEvent
  | IGridChangeSetEvent
  | IGridSelectionChangeEvent;

export type IGridReadyEvent = {
  type: 'GRID/ready';
  payload: { grid: Grid };
};

/**
 * Keyboard
 */
export type IGridKeydownEvent = {
  type: 'GRID/keydown';
  payload: IGridKeypress;
};
export type IGridKeypress = {
  key: KeyboardEvent['key'];
  event: KeyboardEvent;
  grid: Grid;
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
  grid: Grid;
  cell: Cell;
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
  grid: Grid;
  selection: IGridSelection;
};
