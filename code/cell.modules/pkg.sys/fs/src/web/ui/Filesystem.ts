import { ModuleInfo } from './ModuleInfo';
import { FsPathList } from './FsPathList';
import { FsCard as Card } from './FsCard';
import { Filesystem as IndexedDb } from '../FsBus.IndexedDb';
import { Path } from './common';

export const Filesystem = {
  Path,
  IndexedDb,

  // <Component>
  ModuleInfo,
  PathList: FsPathList,
  Card,
};
