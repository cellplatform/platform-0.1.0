import * as t from '../common/types';

export type FuncParam = t.Json | undefined;
export type FuncResponse = any;
export type FuncInvoker = (args: { params: FuncParam[] }) => Promise<FuncResponse>;

export type GetFunc = (args: {
  namespace: string;
  name: string;
}) => Promise<FuncInvoker | undefined>;

/**
 * Response from calculating a single cell function.
 */
export type IFuncResponse<T = any> = {
  ok: boolean;
  type: t.RefTarget;
  cell: string;
  formula: string;
  data?: T;
  error?: IFuncError;
};

/**
 * Response from updating a set of cell functions.
 */
export type IFuncUpdateMap = { [key: string]: t.IFuncResponse };
export type IFuncUpdateResponse = {
  ok: boolean;
  list: t.IFuncResponse[];
  map: IFuncUpdateMap;
};

/**
 * Error.
 */
export type FuncError = 'NOT_FORMULA' | 'NOT_FOUND' | 'NOT_SUPPORTED/RANGE' | 'CIRCULAR' | 'REF';
export type IFuncError = {
  type: FuncError;
  message: string;
  cell: { key: string; value: string };
};
