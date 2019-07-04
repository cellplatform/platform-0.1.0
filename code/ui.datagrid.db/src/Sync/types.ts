import * as t from '../types';
/**
 * [Events]
 */
export type SyncEvent = ISyncGridCellsChangedEvent | ISyncGridDbCellChangedEvent;

export type ISyncGridCellsChangedEvent = {
  type: 'GRID/sync/changed/grid/cells';
  payload: ISyncGridCellsChanged;
};
export type ISyncGridCellsChanged = {
  changes: Array<{ key: string; value: t.CellValue }>;
  isCancelled: boolean;
  cancel(): void;
};

export type ISyncGridDbCellChangedEvent = {
  type: 'GRID/sync/changed/db/cell';
  payload: ISyncGridDbCellChanged;
};
export type ISyncGridDbCellChanged = {
  cell: { key: string; value: t.CellValue };
  isCancelled: boolean;
  cancel(): void;
};
