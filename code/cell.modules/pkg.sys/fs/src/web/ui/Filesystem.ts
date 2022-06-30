import { ModuleInfo } from './ModuleInfo';
import { FsPathList as PathList } from './Fs.PathList';
import { Filesystem as IndexedDb } from '../FsBus.IndexedDb';
import { Path, Filesize } from './common';

export { Path, Filesize };

export const Filesystem = {
  IndexedDb,
  Events: IndexedDb.Events,
  Filesize,
  Path,

  /**
   * UI <Components>
   */
  ModuleInfo,
  PathList,
};
