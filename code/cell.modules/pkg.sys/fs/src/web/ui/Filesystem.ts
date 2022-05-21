import { ModuleInfo } from './ModuleInfo';
import { FsPathList as PathList } from './Fs.PathList';
import { FsCard as Card } from './Fs.Card';
import { Filesystem as IndexedDb } from '../FsBus.IndexedDb';
import { Path } from './common';

export const Filesystem = {
  Path,
  IndexedDb,

  // <Component>
  ModuleInfo,
  PathList,
  Card,
};
