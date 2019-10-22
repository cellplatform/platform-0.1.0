import { t } from './common';

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
  error?: t.IFuncError;
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
