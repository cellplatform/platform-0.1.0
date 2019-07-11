import * as t from '../common/types';

// export type ISyncCancel = {
//   isCancelled: boolean;
//   cancel(): void;
// };

/**
 * Change
 */
export type SyncChangeType = ISyncChangeCell | ISyncChangeColumn | ISyncChangeRow;
export type ISyncChange<V = any> = { source: 'DB' | 'GRID'; key: string; value: V };
export type ISyncChangeCell = { kind: 'cell' } & ISyncChange<t.CellValue>;
export type ISyncChangeColumn = { kind: 'column' } & ISyncChange<t.IGridColumn>;
export type ISyncChangeRow = { kind: 'row' } & ISyncChange<t.IGridRow>;

/**
 * [Events]
 */
export type SyncEvent = ISyncingEvent; // | ISyncChangedEvent;

export type ISyncing = SyncChangeType; // & ISyncCancel;
export type ISyncingEvent = {
  type: 'DB/syncing';
  payload: ISyncing;
};

// export type ISyncChanged = SyncChangeType;
// export type ISyncChangedEvent = {
//   type: 'SYNC/changed';
//   payload: ISyncChanged;
// };
