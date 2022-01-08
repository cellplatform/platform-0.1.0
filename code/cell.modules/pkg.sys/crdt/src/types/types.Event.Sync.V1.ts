import * as t from '../common/types';

type O = Record<string, unknown>;
type DocumentId = string;
type PeerId = string;

export type CrdtSyncV1Event = CrdtSyncV1InitEvent | CrdtSyncV1ChangedEvent;

/**
 * Sync: Initialize
 */
export type CrdtSyncV1InitEvent<T extends O = O> = {
  type: 'sys.crdt/sync:v1/init';
  payload: CrdtSyncV1Init<T>;
};
export type CrdtSyncV1Init<T extends O = O> = { doc: { id: DocumentId; data: T } };

/**
 * Sync: Change alert.
 */
export type CrdtSyncV1ChangedEvent = {
  type: 'sys.crdt/sync:v1/changed';
  payload: CrdtSyncV1Changed;
};
export type CrdtSyncV1Changed = {
  peer: PeerId;
  doc: { id: DocumentId; changes: Uint8Array[] };
};
