import * as t from '@platform/cell.types';

/**
 * Namespace
 */
export type ReqNsQueryCoord = string; // Eg: "A1", "A", "1", "A2,B,10,C1:C9"
export type ReqNsQueryData = boolean | string; // true (everything) or comma seperated eg: "cells" | "ns,cell,columns,row" | "A2,B,10,C1:C9"

export type IReqNsParams = { id: string };
export type IReqNsQuery = {
  data?: boolean; // true: all (cells/rows/columns) - overrides other fields.
  cells?: boolean | string; // true: all | string: key or range, eg "A1", "A1:C10"
  columns?: boolean | string;
  rows?: boolean | string;
};

/**
 * Namespace: GET
 */
export type IGetNsResponse = {
  uri: string;
  exists: boolean;
  createdAt: number;
  modifiedAt: number;
  data: IGetNsResponseData;
};
export type IGetNsResponseData = { ns: t.INs } & Partial<t.INsCoordData>;

/**
 * Namespace: POST
 */
export type IPostNsBody = {
  ns?: Partial<t.INsProps>;
  cells?: t.IMap<t.ICellData>;
  columns?: t.IMap<t.IColumnData>;
  rows?: t.IMap<t.IRowData>;
};
export type IPostNsResponse = IGetNsResponse;
