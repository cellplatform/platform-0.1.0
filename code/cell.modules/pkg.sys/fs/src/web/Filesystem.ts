import { Path } from './common';
import { Filesystem as Web } from '@platform/cell.fs.bus/lib/web';
import { Filesystem as IndexedDb } from './FsBus.IndexedDb';

export const Filesystem = {
  Web,
  IndexedDb,
  Path,
};
