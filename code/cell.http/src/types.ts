import * as t from '@platform/cell.types';

/**
 * TODO 🐷 Move to `cell.types`
 */

/**
 * Config
 */

export type IConfigCloud = {
  title: string;
  collection: string;
  now: {
    name: string;
    domain: string;
    subdomain?: string; // Used as DB name (or "prod" if no specified).
    mongo: string; // [zeit/now] secret key (eg "@mongo").  "@" not required.
  };
};

export type IConfigNowFile = {
  version: number;
  name: string;
  alias: string;
  env: { [key: string]: string };
};

/**
 * Payloads
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
export type IReqGetNsQuery = IReqNsQuery;
export type IResGetNs = IGetResponse<IResGetNsData>;
export type IResGetNsData = { ns: t.INs } & Partial<t.INsDataCoord>;

/**
 * Namespace: POST
 */
export type IReqPostNsQuery = IReqNsQuery & {
  calc?: boolean; // perform calcuations (default: false).
  changes?: boolean; // return change list (default: false).
};

export type IReqPostNsBody = {
  ns?: Partial<t.INsProps>;
  cells?: t.IMap<t.ICellData>;
  columns?: t.IMap<t.IColumnData>;
  rows?: t.IMap<t.IRowData>;
};
export type IResPostNs = IResGetNs & { changes?: t.IDbModelChange[] };

/**
 * Coord: cell|row|col
 */
export type IReqCoordParams = { id: string; key: string };
export type IReqCoordQuery = {};

/**
 * GET
 */
export type IResGetCoord = IResGetCell | IResGetRow | IResGetColumn;

export type IResGetCell = IGetResponse<IResGetCellData>;
export type IResGetCellData = t.ICellData;

export type IResGetRow = IGetResponse<IResGetRowData>;
export type IResGetRowData = t.IRowData;

export type IResGetColumn = IGetResponse<IResGetColumnData>;
export type IResGetColumnData = t.IColumnData;
