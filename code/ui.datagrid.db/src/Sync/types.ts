import * as t from '../common/types';

export type ISyncCancel = {
  isCancelled: boolean;
  cancel(): void;
};

/**
 * Change
 */
export type ISyncChanges<V = any> = Array<{ key: string; value: V }>;
export type ISyncGridChange = ISyncGridChangeCells | ISyncGridChangeColumns | ISyncGridChangeRows;
export type ISyncGridChangeCells = { kind: 'cells'; changes: ISyncChanges<t.CellValue> };
export type ISyncGridChangeColumns = { kind: 'columns'; changes: ISyncChanges<t.IGridColumn> };
export type ISyncGridChangeRows = { kind: 'rows'; changes: ISyncChanges<t.IGridRow> };

/**
 * [Events]
 */
export type SyncEvent = ISyncGridChangedEvent | ISyncGridDbCellChangedEvent;

export type ISyncGridChangedEvent = {
  type: 'SYNC/changed/grid';
  payload: ISyncGridChange & ISyncCancel;
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
