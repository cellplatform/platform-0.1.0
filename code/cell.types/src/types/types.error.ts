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
export type IFsError<E extends FsError = FsError> = IError<E> & { path: string };

/**
 * File errors
 */
export type FileError = 'FILE/upload';
export type IFileError<E extends FileError = FileError> = IError<E> & { filename: string };
export type IFileUploadError = IFileError<'FILE/upload'>;

/**
 * TypeSystem errors
 */
export type TypeError = ITypeError['type'];
export type ITypeError =
  | ITypeErrorDef
  | ITypeErrorDefInvalid
  | ITypeErrorNotFound
  | ITypeErrorTarget
  | ITypeErrorRef
  | ITypeErrorCircularRef
  | ITypeErrorRefTypename
  | ITypeErrorDuplicateProp
  | ITypeErrorDuplicateTypename
  | ITypeErrorSheet;

type TypeErrorProps = { ns: string; column?: string };
export type ITypeErrorDef = t.IError<'TYPE/def'> & TypeErrorProps;
export type ITypeErrorDefInvalid = t.IError<'TYPE/def/invalid'> & TypeErrorProps;
export type ITypeErrorNotFound = t.IError<'TYPE/notFound'> & TypeErrorProps;
export type ITypeErrorTarget = t.IError<'TYPE/target'> & TypeErrorProps;
export type ITypeErrorRef = t.IError<'TYPE/ref'> & TypeErrorProps;
export type ITypeErrorCircularRef = t.IError<'TYPE/ref/circular'> & TypeErrorProps;
export type ITypeErrorRefTypename = t.IError<'TYPE/ref/typename'> & TypeErrorProps;
export type ITypeErrorDuplicateProp = t.IError<'TYPE/duplicate/prop'> & TypeErrorProps;
export type ITypeErrorDuplicateTypename = t.IError<'TYPE/duplicate/typename'> & TypeErrorProps;
export type ITypeErrorSheet = t.IError<'TYPE/sheet'> & TypeErrorProps;

/**
 * Http errors
 */
export type HttpError = IHttpError['type'];
export type IHttpError =
  | IHttpErrorServer
  | IHttpErrorConfig
  | IHttpErrorNotFound
  | IHttpErrorNotLinked
  | IHttpErrorFile
  | IHttpErrorMalformedUri
  | IHttpErrorHashMismatch
  | IHttpErrorType;

type HttpErrorProps = { status: number };
export type IHttpErrorServer = t.IError<'HTTP/server'> & HttpErrorProps;
export type IHttpErrorConfig = t.IError<'HTTP/config'> & HttpErrorProps;
export type IHttpErrorNotFound = t.IError<'HTTP/notFound'> & HttpErrorProps;
export type IHttpErrorNotLinked = t.IError<'HTTP/notLinked'> & HttpErrorProps;
export type IHttpErrorFile = t.IError<'HTTP/file'> & HttpErrorProps;
export type IHttpErrorMalformedUri = t.IError<'HTTP/uri/malformed'> & HttpErrorProps;
export type IHttpErrorHashMismatch = t.IError<'HTTP/hash/mismatch'> & HttpErrorProps;
export type IHttpErrorType = t.IError<'HTTP/type'> & HttpErrorProps;

export type FsHttpError = IHttpError['type'];
export type IFsHttpError = IFsError & HttpErrorProps;
