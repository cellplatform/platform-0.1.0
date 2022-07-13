import * as t from '../web/common/types';

type FilesystemId = string;
type FilePath = string;

/**
 * Filesystem controller instance.
 */
export type SysFsController = t.Disposable & {
  id: FilesystemId;
  dir: FilePath;
  events: t.SysFsEvents;
  fs: t.SysFsEvents['fs'];
};
