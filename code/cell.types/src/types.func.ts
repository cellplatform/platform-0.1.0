import { Subject } from 'rxjs';
import { t } from './common';

export type FuncParam = t.Json | undefined;
export type FuncResponse = any;
export type FuncInvoker = (args: { params: FuncParam[] }) => Promise<FuncResponse>;

export type GetFunc = (args: IGetFuncArgs) => Promise<FuncInvoker | undefined>;
export type IGetFuncArgs = { namespace: string; name: string };

export type FuncPromise<T> = Promise<T> & { eid: string };

/**
 * Response from calculating a single cell function.
 */
export type IFuncResponse<T = any> = {
  ok: boolean;
  eid: string; // "execution" identifier.
  elapsed: number; // msecs.
  type: t.RefTarget;
  cell: string;
  formula: string;
  data?: T;
  error?: t.IFuncError;
};

/**
 * Response from updating a set of cell functions.
 */
export type IFuncResponseMap = { [key: string]: t.IFuncResponse };
export type IFuncManyResponse = {
  ok: boolean;
  eid: string; // "execution" identifier.
  elapsed: number; // msecs.
  list: t.IFuncResponse[];
  map: IFuncResponseMap;
};

/**
 * Table calculations.
 */
export type IFuncTable = {
  getCells: t.GetCells;
  refsTable: t.IRefsTable;
  getFunc: t.GetFunc;
  calculate(args?: {
    cells?: string | string[];
    events$?: Subject<FuncEvent>;
  }): Promise<t.IFuncTableResponse>;
};
export type IFuncTableResponse = {
  ok: boolean;
  eid: string; // "execution" identifier.
  elapsed: number; // msecs.
  list: t.IFuncResponse[];
  from: t.ICellTable;
  to: t.ICellTable;
};

/**
 * [Events]
 */
export type FuncEvent = FuncOneEvent | FuncManyEvent;
export type FuncOneEvent = IFuncBeginEvent | IFuncEndEvent;
export type FuncManyEvent = IFuncManyBeginEvent | IFuncManyEndEvent;

export type IFuncBeginEvent = {
  type: 'FUNC/begin';
  payload: IFuncBegin;
};
export type IFuncBegin = {
  eid: string; // "execution" identifier.
  cell: string;
  formula: string;
};

export type IFuncEndEvent = {
  type: 'FUNC/end';
  payload: IFuncEnd;
};
export type IFuncEnd = IFuncResponse;

export type IFuncManyBeginEvent = {
  type: 'FUNC/many/begin';
  payload: IFuncManyBegin;
};
export type IFuncManyBegin = {
  eid: string; // "execution" identifier.
  cells: string[];
};

export type IFuncManyEndEvent = {
  type: 'FUNC/many/end';
  payload: IFuncManyEnd;
};
export type IFuncManyEnd = IFuncManyResponse;
