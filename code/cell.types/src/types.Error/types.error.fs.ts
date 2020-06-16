import { t } from '../common';

/**
 * FileSystem errors
 */
export type FsError =
  | 'FS/read'
  | 'FS/read/404'
  | 'FS/read/cloud'
  | 'FS/write'
  | 'FS/write/cloud'
  | 'FS/delete'
  | 'FS/delete/cloud';
export type IFsError<E extends FsError = FsError> = t.IError<E> & { path: string };

/**
 * File errors
 */
export type FileError = 'FILE/upload';
export type IFileError<E extends FileError = FileError> = t.IError<E> & { filename: string };
export type IFileUploadError = IFileError<'FILE/upload'>;
