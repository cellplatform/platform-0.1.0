import { ModuleInfo } from './ModuleInfo';
import { PathList } from './PathList';
import { FsCard as Card } from './FsCard';
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
