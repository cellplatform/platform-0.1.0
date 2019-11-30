import { IFileSystemError } from './types.error';

export type IFileSystem = {
  root: string; // Root directory of the file-system.
  resolve(uri: string): string;
  read(uri: string): Promise<IFileSystemRead>;
  write(uri: string, data: Buffer): Promise<IFileSystemWrite>;
};
export type IS3FileSystem = IFileSystem & { bucket: string };

export type IFileSystemFile = {
  uri: string;
  path: string;
  data: Buffer;
};

export type IFileSystemRead = {
  status: number;
  file?: IFileSystemFile;
  error?: IFileSystemError;
};

export type IFileSystemWrite = {
  status: number;
  file: IFileSystemFile;
  error?: IFileSystemError;
};
