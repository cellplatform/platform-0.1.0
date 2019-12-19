import { IFileSystemError } from './types.error';

export type IFileSystem = IFileSystemS3 | IFileSystemLocal;

export type IFileSystemLocal = IFileSystemMembers & { type: 'FS' };
export type IFileSystemS3 = IFileSystemMembers & { type: 'S3'; bucket: string };

export type IFileSystemMembers = {
  root: string; // Root directory of the file-system.
  resolve(uri: string): string;
  read(uri: string): Promise<IFileSystemRead>;
  write(uri: string, data: Buffer, options?: { filename?: string }): Promise<IFileSystemWrite>;
  delete(uri: string | string[]): Promise<IFileSystemDelete>;
};

export type IFileSystemFile = {
  uri: string;
  path: string;
  data: Buffer;
  hash: string;
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
