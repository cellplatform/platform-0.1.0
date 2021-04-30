import { t } from './common';

export type NetFsEvent = FsFilesEvent;

/**
 * Represents a file to be transported over the network.
 */
export type FsFilesEvent = {
  type: 'sys.net/fs/files';
  payload: GroupFsFiles;
};
export type GroupFsFiles = {
  source: t.PeerId;
  files: t.PeerFile[];
};
