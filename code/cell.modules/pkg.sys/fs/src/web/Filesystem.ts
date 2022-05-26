import { Path } from './common';
import { Filesystem as IndexedDb } from './FsBus.IndexedDb';
import { Filesize } from './Filesize';

export const Filesystem = {
  IndexedDb,
  Events: IndexedDb.Events,
  Filesize,
  Path,
};
