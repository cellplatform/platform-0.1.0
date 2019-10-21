import { t } from './common';

/**
 * Error
 */
export type IError<T extends string = any> = {
  type: T;
  message: string;
  children?: IError[];
};

export type IErrorParent<T extends string = any> = { error?: IError<T> };

/**
 * Ref errors
 */
export type IRefErrorCircular = t.IError<'REF/circular'> & { path: string };
export type IRefErrorName = t.IError<'REF/name'> & { path: string };
export type IRefError = IRefErrorCircular | IRefErrorName;
export type RefError = IRefError['type'];
