import { t } from '../common';

type FilePath = string;

/**
 * Information about a file.
 */
export type FsFileInfo = {
  kind: 'file' | 'dir' | 'unknown';
  path: FilePath;
  exists: boolean;
  hash: string;
  bytes: number;
};

/**
 * High-level client API that makes programming against
 * a lower-level platform [FsDriver] isolated, consistent and easy.
 */
export type Fs = {
  info: FsInfoMethod;
  exists: FsExistsMethod;
  read: FsReadMethod;
  write: FsWriteMethod;
  copy: FsCopyMethod;
  move: FsMoveMethod;
  delete: FsDeleteMethod;
};

type FsInfoMethod = (path: FilePath) => Promise<FsFileInfo>;
type FsExistsMethod = (path: FilePath) => Promise<boolean>;

type FsReadMethod = (path: FilePath) => Promise<FsReadMethodResponse>;
type FsReadMethodResponse = Uint8Array | undefined;

type FsWriteMethod = (path: FilePath, data: FsWriteMethodData) => Promise<FsWriteMethodResponse>;
type FsWriteMethodData = t.Json | Uint8Array | ReadableStream;
type FsWriteMethodResponse = { hash: string; bytes: number };

type FsCopyMethod = (source: FilePath, target: FilePath) => Promise<void>;
type FsMoveMethod = (source: FilePath, target: FilePath) => Promise<void>;
type FsDeleteMethod = (path: FilePath) => Promise<void>;
