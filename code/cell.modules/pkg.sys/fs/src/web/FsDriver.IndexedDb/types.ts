import { Disposable } from '@platform/types';
import { FsDriverLocal, FsIndexer, ManifestFileImage } from '@platform/cell.types';

export type FsIndexedDb = Disposable & {
  id: string;
  version: number;
  driver: FsDriverLocal;
  index: FsIndexer;
};

/**
 * IndexedDB structures.
 */
type FilePath = string;
type FileDir = string;
type FileHash = string;
export type BinaryRecord = { hash: FileHash; data: Uint8Array };
export type PathRecord = {
  path: FilePath;
  dir: FileDir;
  hash: FileHash;
  bytes: number;
  image?: ManifestFileImage;
};
