import { t } from './common';

type FilesystemId = string;
type FilePath = string;

export type SysFsInfo = {
  id: FilesystemId;
  dir: string; // The root directory of the file-system scope.
};

export type SysFsFileInfo = {
  path: FilePath;
  exists: boolean | null;
  hash: string;
  bytes: number;
  error?: SysFsError;
};

export type SysFsFile = { path: FilePath; data: Uint8Array; hash: string };
export type SysFsFileTarget = { source: FilePath; target: FilePath };

export type SysFsFileReadResponse = { file?: SysFsFile; error?: SysFsError };
export type SysFsFileWriteResponse = { path: FilePath; error?: SysFsError };
export type SysFsFileDeleteResponse = { path: FilePath; error?: SysFsError };
export type SysFsFileCopyResponse = { source: FilePath; target: FilePath; error?: SysFsError };
export type SysFsFileMoveResponse = { source: FilePath; target: FilePath; error?: SysFsError };

export type SysFsReadResponse = { files: SysFsFileReadResponse[]; error?: SysFsError };
export type SysFsWriteResponse = { files: SysFsFileWriteResponse[]; error?: SysFsError };
export type SysFsDeleteResponse = { files: SysFsFileDeleteResponse[]; error?: SysFsError };
export type SysFsCopyResponse = { files: SysFsFileCopyResponse[]; error?: SysFsError };
export type SysFsMoveResponse = { files: SysFsFileMoveResponse[]; error?: SysFsError };

export type SysFsError = { code: SysFsErrorCode; message: string };
export type SysFsErrorCode =
  | 'client/timeout'
  | 'info'
  | 'read'
  | 'write'
  | 'delete'
  | 'copy'
  | 'move';
