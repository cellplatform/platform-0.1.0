/**
 * Error
 */
export type IError<T extends string = string> = {
  type: T;
  message: string;
  stack?: string;
  children?: IError[];
};
export type IErrorParent<T extends string = string> = { error?: IError<T> };
