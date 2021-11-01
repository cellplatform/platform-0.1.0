import { Disposable } from '@platform/types';
import { FsDriverLocal } from '@platform/cell.types';

export type FsDriverIndexedDb = Disposable & {
  name: string;
  version: number;
  driver: FsDriverLocal;
};
