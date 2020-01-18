import { t } from '../common';

/**
 * Error
 */
export type IError<T extends string = string> = {
  type: T;
  message: string;
  children?: IError[];
};
export type IErrorParent<T extends string = string> = { error?: IError<T> };
export type IHttpError<T extends string = string> = IError<T> & { status: number };

/**
 * Ref errors
 */
export type RefError = IRefError['type'];
export type IRefError = IRefErrorCircular | IRefErrorName;

type RefErrorProps = { path: string };
export type IRefErrorCircular = t.IError<'REF/circular'> & RefErrorProps;
export type IRefErrorName = t.IError<'REF/name'> & RefErrorProps;

/**
 * Func errors
 */
export type FuncError = IFuncError['type'];
export type IFuncError =
  | IFuncErrorNotFormula
  | IFuncErrorNotFound
  | IFuncErrorNotSupported
  | IFuncErrorInvoke
  | IFuncErrorCircularRef; // NB: Func execution can also result in a REF error.

type FuncErrorProps = { formula: string; path: string };
export type IFuncErrorNotFormula = t.IError<'FUNC/notFormula'> & FuncErrorProps;
export type IFuncErrorNotFound = t.IError<'FUNC/notFound'> & FuncErrorProps;

export type IFuncErrorNotSupported = IFuncErrorNotSupportedRange;
export type IFuncErrorNotSupportedRange = t.IError<'FUNC/notSupported/range'> & FuncErrorProps;

export type IFuncErrorInvoke = t.IError<'FUNC/invoke'> & FuncErrorProps;
export type IFuncErrorCircularRef = t.IError<'REF/circular'> & FuncErrorProps;

/**
 * URI errors
 */
type UriErrorProps = { uri: string };
export type IUriError = t.IError<'URI'> & UriErrorProps;

/**
 * File-system errors
 */
export type FsError =
  | 'FS/read'
  | 'FS/read/404'
  | 'FS/read/cloud'
  | 'FS/write'
  | 'FS/write/cloud'
  | 'FS/delete'
  | 'FS/delete/cloud';
export type IFsError<E extends FsError = FsError> = IError<E> & { path: string };

/**
 * File errors.
 */
export type FileError = 'FILE/upload';
export type IFileError<E extends FileError = FileError> = IError<E> & { filename: string };
export type IFileUploadError = IFileError<'FILE/upload'>;
