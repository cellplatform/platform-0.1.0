import * as t from '../common/types';

export type FuncParam = t.Json | undefined;
export type FuncResponse = any;
export type FuncInvoker = (args: { params: FuncParam[] }) => Promise<FuncResponse>;

export type GetFunc = (args: {
  namespace: string;
  name: string;
}) => Promise<FuncInvoker | undefined>;

/**
 * Response from calculating a function.
 */
export type IFuncResponse<T = any> = {
  ok: boolean;
  cell: string;
  formula: string;
  data?: T;
  error?: IFuncError;
};

/**
 * Error.
 */
export type FuncError = 'NOT_FORMULA' | 'NOT_FOUND' | 'CIRCULAR' | 'REF';
export type IFuncError = {
  type: FuncError;
  message: string;
  cell: { key: string; value: string };
};
