import { Grid, Cell } from '../api';
import * as t from '../../types';

/**
 * [Events]
 */
export type GridEvent = t.EditorEvent | IGridKeydownEvent | IGridChangeEvent | IGridChangeSetEvent;

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
  row: number;
  column: number;
  source: GridChangeType;
  grid: Grid;
  cell: Cell;
  value: { from?: t.CellValue; to?: t.CellValue };
  isCancelled: boolean;
  cancel(): void;
};
