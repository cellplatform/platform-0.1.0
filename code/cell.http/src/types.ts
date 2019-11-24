import * as t from '@platform/cell.types';

/**
 * TODO 🐷 Move to `cell.types`
 */

export type IErrorPayload = { status: number; data: t.IHttpError };
export type INotFoundResponse = t.IHttpError<'HTTP/404'> & { status: 404; url: string };

export type IGetResponse<D> = {
  uri: string;
  exists: boolean;
  createdAt: number;
  modifiedAt: number;
  data: D;
};

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
 * GET
 */
export type IGetNsResponse = IGetResponse<IGetNsResponseData>;
export type IGetNsResponseData = { ns: t.INs } & Partial<t.INsDataCoord>;

/**
 * POST
 */
export type IPostNsBody = {
  ns?: Partial<t.INsProps>;
  cells?: t.IMap<t.ICellData>;
  columns?: t.IMap<t.IColumnData>;
  rows?: t.IMap<t.IRowData>;
  calc?: boolean; // perform calcuations.
};
export type IPostNsResponse = IGetNsResponse & { changes: t.IDbModelChange[] };

/**
 * Coord: cell|row|col
 */
export type IReqCoordParams = { id: string; key: string };
export type IReqCoordQuery = {};

/**
 * GET
 */
export type IGetCoordResponse = IGetCellResponse | IGetRowResponse | IGetColumnResponse;

export type IGetCellResponse = IGetResponse<IGetCellResponseData>;
export type IGetCellResponseData = t.ICellData;

export type IGetRowResponse = IGetResponse<IGetRowResponseData>;
export type IGetRowResponseData = t.IRowData;

export type IGetColumnResponse = IGetResponse<IGetColumnResponseData>;
export type IGetColumnResponseData = t.IColumnData;
