import { IDisposable } from '@platform/types';

export type CrdtConnectionId = string;
export type CrdtModelId = string;

export type CrdtConnection = IDisposable & {
  id: CrdtConnectionId;
  isEnabled: boolean;
};

/**
 * EVENTS
 */
export type CrdtEvent = CrdtBroadcastChangeEvent;

/**
 * Broadcasts a change to a document.
 */
export type CrdtBroadcastChangeEvent = {
  type: 'CRDT/broadcast/change';
  payload: CrdtBroadcastChange;
};
export type CrdtBroadcastChange = {
  id: { connection: CrdtConnectionId; model: CrdtModelId };
  changes: string;
};
