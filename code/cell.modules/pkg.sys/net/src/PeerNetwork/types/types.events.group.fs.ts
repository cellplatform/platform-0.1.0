import { t } from './common';

export type GroupFsEvent = GroupFsFilesEvent;

/**
 * Represents a file to be transported over the network.
 */
export type GroupFsFilesEvent = {
  type: 'sys.net/group/fs/files';
  payload: GroupFsFiles;
};
export type GroupFsFiles = {
  source: t.PeerId;
  files: t.PeerFile[];
};
