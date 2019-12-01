import * as t from '@platform/cell.types';

/**
 * TODO 🐷 Move to `cell.types`
 */

/**
 * Configuration
 */

export type IConfigFileArgs = { path?: string; throw?: boolean };
export type IConfigFile = {
  path: string;
  exists: boolean;
  data: IConfigDeployment;
  validate(): IValidation;
};
export type IValidation = {
  isValid: boolean;
  errors: t.IError[];
};

export type IConfigDeployment = {
  title: string;
  collection: string;
  fs: {
    endpoint: string;
    root: string;
  };
  now: {
    deployment: string; // The "project name" of the now deployment. see CLI: `now ls`.
    domain: string;
    subdomain?: string; // NB: Used as DB name (uses "prod" if not specified).
  };
  secret: {
    // Keys for [zeit/now] secrets. NB: the "@" prefix is not required (eg "@mongo").
    mongo: string;
    s3: { key: string; secret: string };
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
  cells?: boolean | string | Array<string | boolean>; // true: all | string: key or range, eg "A1", "A1:C10"
  columns?: boolean | string | Array<string | boolean>;
  rows?: boolean | string | Array<string | boolean>;
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
  changes?: boolean; // return list of changes (default: true).
};

export type IReqPostNsBody = {
  ns?: Partial<t.INsProps>;
  cells?: t.IMap<t.ICellData>;
  columns?: t.IMap<t.IColumnData>;
  rows?: t.IMap<t.IRowData>;
  calc?: boolean | string | Array<string | boolean>; // Perform calcuations (default: false), if string key/range of cells to calculate, eg "A1", "A1:C10"
};
export type IResPostNs = IResGetNs & { changes?: t.IDbModelChange[] };

/**
 * Coord: cell|row|col
 */

export type IReqCoordParams = { ns: string; key: string };
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

/**
 * File
 */
export type IReqFileParams = { ns: string; file: string };
export type IReqFileQuery = {};
export type IReqFilePullQuery = {};

/**
 * File: GET
 */
export type IResGetFile = IGetResponse<IResGetFileData>;
export type IResGetFileData = t.IFileData & {};

/**
 * File: POST
 */
export type IReqPostFileQuery = IReqFileQuery & {
  changes?: boolean; // return list of changes (default: true).
};
export type IReqPostFileBody = {};
export type IResPostFile = IResGetFile & { changes?: t.IDbModelChange[] };

/**
 * Cell/File
 */

export type IReqCellFileParams = IReqCoordParams & { filename: string };
// export type IReqCoordParams = { ns: string; key: string };
export type IReqPostCellFileQuery = {
  changes?: boolean; // return list of changes (default: true).
};

export type IResPostCellFile = IGetResponse<IResPostCellFileData>;
export type IResPostCellFileData = {
  cell: t.ICellData;
  changes?: t.IDbModelChange[];
};

/**
 * Info (System)
 */

export type IResGetInfo = {
  system: string;
  domain: string;
  region: string;
  version: { [key: string]: string };
  deployedAt?: {
    datetime: string;
    timestamp: number;
    timezone: string;
  };
};
