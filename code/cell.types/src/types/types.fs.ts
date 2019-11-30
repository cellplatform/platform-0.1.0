import { IFileSystemError } from './types.error';

export type IFileSystem = {
  root: string; // Root directory of the file system.
  resolve(uri: string): string;
  read(uri: string): Promise<IFileReadResponse>;
  write(uri: string, data: Buffer): Promise<IFileWriteResponse>;
};
export type IS3FileSystem = IFileSystem & { bucket: string };

export type IFile = {
  uri: string;
  path: string;
  data: Buffer;
};

export type IFileReadResponse = {
  status: number;
  file?: IFile;
  error?: IFileSystemError;
};

export type IFileWriteResponse = {
  status: number;
  file: IFile;
  error?: IFileSystemError;
};
