import { ModuleInfo } from './ModuleInfo';
import { FsPathList as PathList } from './Fs.PathList';
import { FsCard as Card } from './Fs.Card';
import { Filesystem as IndexedDb } from '../FsBus.IndexedDb';
import { Path, Filesize } from './common';

export { Path, Filesize };

export const Filesystem = {
  IndexedDb,
  Filesize,
  Path,

  /**
   * UI <Components>
   */
  ModuleInfo,
  PathList,
  Card,
};
