import { IFileSystemError } from './types.error';

/**
 * API
 */
export type IFileSystem = IFileSystemS3 | IFileSystemLocal;
export type IFileSystemLocal = IFileSystemMembers & { type: 'FS' };
export type IFileSystemS3 = IFileSystemMembers & { type: 'S3'; bucket: string };

/**
 * Filesystem Members
 */
export type IFileSystemMembers = {
  root: string; // Root directory of the file-system.
  resolve(uri: string): IFileSystemResolve;
  read(uri: string): Promise<IFileSystemRead>;
  write(uri: string, data: Buffer, options?: { filename?: string }): Promise<IFileSystemWrite>;
  delete(uri: string | string[]): Promise<IFileSystemDelete>;
};

export type IFileSystemResolve = {
  path: string;
  props: { [key: string]: string };
};

export type IFileSystemRead = {
  ok: boolean;
  status: number;
  location: string;
  file?: IFileSystemFile;
  error?: IFileSystemError;
};

export type IFileSystemWrite = {
  ok: boolean;
  status: number;
  location: string;
  file: IFileSystemFile;
  error?: IFileSystemError;
};

export type IFileSystemDelete = {
  ok: boolean;
  status: number;
  locations: string[];
  error?: IFileSystemError;
};

/**
 * File
 */
export type IFileSystemFile = {
  uri: string;
  path: string;
  hash: string;
  data: Buffer;
};
