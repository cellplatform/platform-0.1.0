import { t } from '../common';

type FilePath = string;
type DirPath = string;

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
 * High-level [FS] client API making programming
 * lean/simple/powerful/elegant against a
 * standardised lower-level platform [FsDriver].
 */
export type Fs = {
  is: FsIs;
  info: FsInfoMethod;
  manifest: FsGetManifest;
  exists: FsExistsMethod;
  read: FsReadMethod;
  write: FsWriteMethod;
  copy: FsCopyMethod;
  move: FsMoveMethod;
  delete: FsDeleteMethod;
  join: FsJoin;
  dir(path: DirPath): Fs;
  json: FsJson;
};

type FsGetManifest = (options?: t.FsIndexerGetManifestOptions) => Promise<t.DirManifest>;

type FsInfoMethod = (path: FilePath) => Promise<FsFileInfo>;
type FsExistsMethod = (path: FilePath) => Promise<boolean>;

type FsReadMethod = (path: FilePath) => Promise<Uint8Array | undefined>;

type FsWriteMethod = (path: FilePath, data: FsWriteMethodData) => Promise<FsWriteMethodResponse>;
type FsWriteMethodData = t.Json | Uint8Array | ReadableStream;
type FsWriteMethodResponse = { hash: string; bytes: number };

type FsCopyMethod = (source: FilePath, target: FilePath) => Promise<void>;
type FsMoveMethod = (source: FilePath, target: FilePath) => Promise<void>;
type FsDeleteMethod = (path: FilePath) => Promise<void>;

type FsIs = {
  dir(path: FilePath): Promise<boolean>;
  file(path: FilePath): Promise<boolean>;
};

type FsJoin = (...segments: string[]) => string;

type FsJson = {
  read<T>(path: FilePath): Promise<T> | undefined;
  write(path: FilePath, data: t.Json): Promise<FsWriteMethodResponse>;
};
