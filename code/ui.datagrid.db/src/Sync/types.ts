import * as t from '../common/types';

/**
 * Change
 */
export type SyncChangeType = ISyncChangeCell | ISyncChangeColumn | ISyncChangeRow;

export type ISyncChange<V = any> = { source: 'DB' | 'GRID'; key: string; value: V };
export type ISyncChangeCell = { kind: 'CELL' } & ISyncChange<t.IGridCellData>;
export type ISyncChangeColumn = { kind: 'COLUMN' } & ISyncChange<t.IGridColumn>;
export type ISyncChangeRow = { kind: 'ROW' } & ISyncChange<t.IGridRow>;

/**
 * [Events]
 */
export type SyncEvent = ISyncChangeEvent | ISyncedDbEvent | ISyncedGridEvent;

export type ISyncChangeEvent = {
  type: 'SYNC/change';
  payload: SyncChangeType;
};

export type ISyncedDbEvent = {
  type: 'SYNCED/db';
  payload: ISyncedDb;
};
export type ISyncedDb = {
  deletes: Array<{ key: string }>;
  updates: Array<{ key: string; value?: any }>;
};

export type ISyncedGridEvent = {
  type: 'SYNCED/grid';
  payload: ISyncedGrid;
};
export type ISyncedGrid = {
  updates: Array<{ type: t.GridCellType; key: string; value?: any }>;
};
