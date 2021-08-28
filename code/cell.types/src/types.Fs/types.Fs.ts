import { t } from '../common';

type FilePath = string;

/**
 * High-level client API that makes programming against
 * a lower-level platform [FsDriver] isolated, consistent and easy.
 */
export type Fs = {
  exists: FsExists;
  read: FsRead;
  write: FsWrite;
  copy: FsCopy;
  move: FsMove;
};

export type FsExists = (path: FilePath) => Promise<boolean>;

export type FsRead = (path: FilePath) => Promise<FsReadResponse>;
export type FsReadResponse = Uint8Array | undefined;

export type FsWrite = (path: FilePath, data: FsWriteData) => Promise<FsWriteResponse>;
export type FsWriteData = t.Json | Uint8Array | ReadableStream;
export type FsWriteResponse = { hash: string; bytes: number };

export type FsCopy = (source: FilePath, target: FilePath) => Promise<void>;
export type FsMove = (source: FilePath, target: FilePath) => Promise<void>;
