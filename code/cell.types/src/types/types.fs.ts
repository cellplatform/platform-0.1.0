import { IFileSystemError } from './types.error';

export type IFileSystem = IFileSystemS3 | IFileSystemLocal;

export type IFileSystemS3 = IFileSystemMembers & { type: 'S3'; bucket: string };
export type IFileSystemLocal = IFileSystemMembers & { type: 'FS' };

export type IFileSystemMembers = {
  root: string; // Root directory of the file-system.
  resolve(uri: string): string;
  read(uri: string): Promise<IFileSystemRead>;
  write(uri: string, data: Buffer): Promise<IFileSystemWrite>;
};

export type IFileSystemFile = {
  uri: string;
  path: string;
  data: Buffer;
  hash: string;
};

export type IFileSystemRead = {
  status: number;
  location: string;
  file?: IFileSystemFile;
  error?: IFileSystemError;
};

export type IFileSystemWrite = {
  status: number;
  location: string;
  file: IFileSystemFile;
  error?: IFileSystemError;
};
