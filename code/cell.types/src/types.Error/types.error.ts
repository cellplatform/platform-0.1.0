import { t } from '../common';

/**
 * Error
 */
export type IError<T extends string = string> = {
  type: T;
  message: string;
  children?: t.IError[];
};
export type IErrorParent<T extends string = string> = { error?: t.IError<T> };
