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

export type FsInfoMethod = (path: FilePath) => Promise<FsFileInfo>;
export type FsExistsMethod = (path: FilePath) => Promise<boolean>;

export type FsReadMethod = (path: FilePath) => Promise<FsReadMethodResponse>;
export type FsReadMethodResponse = Uint8Array | undefined;

export type FsWriteMethod = (
  path: FilePath,
  data: FsWriteMethodData,
) => Promise<FsWriteMethodResponse>;
export type FsWriteMethodData = t.Json | Uint8Array | ReadableStream;
export type FsWriteMethodResponse = { hash: string; bytes: number };

export type FsCopyMethod = (source: FilePath, target: FilePath) => Promise<void>;
export type FsMoveMethod = (source: FilePath, target: FilePath) => Promise<void>;
export type FsDeleteMethod = (path: FilePath) => Promise<void>;
