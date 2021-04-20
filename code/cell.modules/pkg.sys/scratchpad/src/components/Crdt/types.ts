export type CrdtEvent = CrdtBroadcastChangeEvent;

/**
 * Broadcasts a change to a document.
 */
export type CrdtBroadcastChangeEvent = {
  type: 'CRDT/broadcast/change';
  payload: CrdtBroadcastChange;
};
export type CrdtBroadcastChange = {
  id: string;
  changes: string;
};
