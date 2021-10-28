import { Disposable } from '@platform/types';
import { FsDriverLocal } from '@platform/cell.types';

export type FsDriverIndexedDB = Disposable & {
  name: string;
  version: number;
  driver: FsDriverLocal;
};
