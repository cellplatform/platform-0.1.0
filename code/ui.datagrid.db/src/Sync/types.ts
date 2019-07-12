import * as t from '../common/types';

/**
 * Change
 */
export type SyncChangeType = ISyncChangeCell | ISyncChangeColumn | ISyncChangeRow;

export type ISyncChange<V = any> = { source: 'DB' | 'GRID'; key: string; value: V };
export type ISyncChangeCell = { kind: 'CELL' } & ISyncChange<t.CellValue>;
export type ISyncChangeColumn = { kind: 'COLUMN' } & ISyncChange<t.IGridColumn>;
export type ISyncChangeRow = { kind: 'ROW' } & ISyncChange<t.IGridRow>;

/**
 * [Events]
 */
export type SyncEvent = ISyncingEvent;

export type ISyncing = SyncChangeType;
export type ISyncingEvent = {
  type: 'DB/syncing';
  payload: ISyncing;
};
