import { t } from '../common';

/**
 * FileSystem errors.
 */
export type FsError = 'FS/read' | 'FS/write' | 'FS/delete' | 'FS/copy';
export type IFsError<E extends FsError = FsError> = t.IError<E> & { path: string };

/**
 * File errors.
 */
export type FileError = 'FILE/upload' | 'FILE/copy';
export type IFileError<E extends FileError = FileError> = t.IError<E> & { filename: string };
export type IFileUploadError = IFileError<'FILE/upload'>;
