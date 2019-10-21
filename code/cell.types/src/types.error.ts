/**
 * Error
 */
export type IError<T extends string = any> = {
  type: T;
  message: string;
  children?: IError[];
};

export type IErrorParent<T extends string = any> = { error?: IError<T> };
