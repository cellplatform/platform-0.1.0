import { PeerJS } from '../../common/libs';
import { IStateObjectWritable } from '@platform/state.types';
import * as t from '../../common/types';

export * from '../../common/types';

type O = Record<string, unknown>;

export type ConversationState = {
  imageDir?: string | string[];
  selected?: string;
  zoom?: number;
  offset?: { x: number; y: number };
  videoZoom?: number;
  peers: ConversationStatePeers;
  remote?: { url: string; namespace: string; entry: string; props?: O };
};

export type ConversationStatePeers = { [id: string]: ConversationStatePeer };
export type ConversationStatePeer = {
  id: string;
  userAgent: string;
  isSelf?: boolean;
  resolution: { body?: { width: number; height: number } };
};

export type ConversationModel = IStateObjectWritable<ConversationState>;

/**
 * Events
 */
export type ConversationEvent =
  | ConversationCreatedEvent
  | ConversationConnectEvent
  | ConversationPublishEvent
  | ConversationModelChangeEvent
  | ConversationFileEvent;

/**
 * Peer created.
 */
export type ConversationCreatedEvent = {
  type: 'Conversation/created';
  payload: ConversationCreated;
};
export type ConversationCreated = { peer: PeerJS };

/**
 * Connect to a peer.
 */
export type ConversationConnectEvent = {
  type: 'Conversation/connect';
  payload: ConversationConnect;
};
export type ConversationConnect = { id: string };

/**
 * Send data to all peers.
 */
export type ConversationModelChangeEvent = {
  type: 'Conversation/model/change';
  payload: ConversationModelChange;
};
export type ConversationModelChange = { data: Partial<ConversationState> };

/**
 * Broaqdcast data to all peers.
 */
export type ConversationPublishEvent = {
  type: 'Conversation/publish';
  payload: ConversationPublish;
};
export type ConversationPublish = ConversationPublishModel | ConversationPublishFile;
export type ConversationPublishModel = { kind: 'model'; data: Partial<ConversationState> };
export type ConversationPublishFile = { kind: 'file'; data: t.IHttpClientCellFileUpload };
// export type ConversationPublishLoadRemote = {
//   kind: 'load:remote';
//   data?: { url: string; namespace: string; entry: string; props?: O };
// };

/**
 * File recieved event.
 */
export type ConversationFileEvent = {
  type: 'Conversation/file';
  payload: ConversationFile;
};
export type ConversationFile = {
  data: t.IHttpClientCellFileUpload;
};
