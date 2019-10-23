import { t } from './common';

/**
 * Error
 */
export type IError<T extends string = any> = {
  type: T;
  message: string;
  path: string;
  children?: IError[];
};

export type IErrorParent<T extends string = any> = { error?: IError<T> };

/**
 * Ref errors
 */
export type RefError = IRefError['type'];
export type IRefError = IRefErrorCircular | IRefErrorName;

export type IRefErrorCircular = t.IError<'REF/circular'>;
export type IRefErrorName = t.IError<'REF/name'>;

/**
 * Func errors
 */
export type FuncError = IFuncError['type'];
export type IFuncError = IFuncErrorNotFormula | IFuncErrorNotFound | IFuncErrorNotSupported;

export type IFuncErrorNotFormula = t.IError<'FUNC/notFormula'> & { formula: string };
export type IFuncErrorNotFound = t.IError<'FUNC/notFound'> & { formula: string };

export type IFuncErrorNotSupported = IFuncErrorNotSupportedRange;
export type IFuncErrorNotSupportedRange = t.IError<'FUNC/notSupported/range'> & { formula: string };
