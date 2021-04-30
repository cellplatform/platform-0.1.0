import { t } from './common';

export type NetFsEvent = NetFsAddEvent;

/**
 * Represents a file to be transported over the network.
 */
export type NetFsAddEvent = {
  type: 'sys.net/fs/add';
  payload: NetFsAdd;
};
export type NetFsAdd = {
  source: t.PeerId;
  files: t.PeerFile[];
};
