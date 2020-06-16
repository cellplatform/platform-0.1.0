import { t } from '../common';

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

export type FsHttpError = t.IHttpError['type'];
export type IFsHttpError = t.IFsError & HttpErrorProps;
