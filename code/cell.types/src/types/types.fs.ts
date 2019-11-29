import { IError } from './types.error';

export type IFileSystem = {
  root: string; // Root directory of the file system.
  resolve(uri: string): string;
  read(uri: string): Promise<IFileReadResponse>;
  write(uri: string, data: Buffer): Promise<IFileWriteResponse>;
};

export type IFile = {
  uri: string;
  path: string;
  data: Buffer;
};

export type IFileReadResponse = {
  file?: IFile;
  error?: IFileError;
};

export type IFileWriteResponse = {
  file: IFile;
  error?: IFileError;
};

export type FileError = 'FS/404' | 'FS/write';
export type IFileError = IError<FileError> & { path: string };
