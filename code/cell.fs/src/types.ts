/**
 * TODO 🐷
 * - Move to `cell.types`
 */

import * as t from './common/types';

export type IFile = {
  uri: string;
  path: string;
  data: Buffer;
};

export type IFileSystem = {
  resolve(uri: string): string;
  read(uri: string): Promise<IFileReadResponse>;
  write(uri: string, data: Buffer): Promise<IFileWriteResponse>;
};

export type IFileReadResponse = {
  file?: IFile;
  error?: t.IFileError;
};

export type IFileWriteResponse = {
  file: IFile;
  error?: t.IFileError;
};

export type FileError = 'FS/404' | 'FS/write';
export type IFileError = t.IError<FileError> & { path: string };
