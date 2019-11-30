import { IError } from './types.error';

export type IFileSystem = {
  root: string; // Root directory of the file system.
  resolve(uri: string): string;
  read(uri: string): Promise<IFileReadResponse>;
  write(uri: string, data: Buffer): Promise<IFileWriteResponse>;
};

export type IS3FileSystem = IFileSystem & {
  bucket: string;
};

export type IFile = {
  uri: string;
  path: string;
  data: Buffer;
};

export type IFileReadResponse = {
  status: number;
  file?: IFile;
  error?: IFileError;
};

export type IFileWriteResponse = {
  status: number;
  file: IFile;
  error?: IFileError;
};

export type FileError = 'FS/read' | 'FS/read/404' | 'FS/write' | 'FS/write/cloud';
export type IFileError = IError<FileError> & { path: string };
