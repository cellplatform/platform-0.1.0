import { Disposable } from '@platform/types';
import { FsDriverLocal, FsIndexer } from '@platform/cell.types';

export type FsIndexedDb = Disposable & {
  name: string;
  version: number;
  driver: FsDriverLocal;
  index: FsIndexer;
};
