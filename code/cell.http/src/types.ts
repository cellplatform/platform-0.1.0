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
export type IPayload<D> = { status: number; data: D };
export type IErrorPayload = IPayload<t.IHttpError>;
export type IUriResponse<D, L extends ILinkMap> = {
  uri: string;
  exists: boolean;
  createdAt: number;
  modifiedAt: number;
  data: D;
  links: L;
};

export type ILinkMap = { [key: string]: string };

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
export type IResGetNs = IUriResponse<IResGetNsData, IResGetNsLinks>;
export type IResGetNsData = { ns: t.INs } & Partial<t.INsDataCoord>;
export type IResGetNsLinks = {};

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
export type IReqCellParams = IReqCoordParams;
export type IReqColumnParams = IReqCoordParams;
export type IReqRowParams = IReqCoordParams;
export type IReqCoordQuery = {};

/**
 * GET
 */
export type IResGetCoord = IResGetCell | IResGetRow | IResGetColumn;

export type IResGetCell = IUriResponse<IResGetCellData, IResGetCellLinks>;
export type IResGetCellData = t.ICellData;
export type IResGetCellLinks = { cell: string; files: string };

export type IResGetRow = IUriResponse<IResGetRowData, IResGetRowLinks>;
export type IResGetRowData = t.IRowData;
export type IResGetRowLinks = {};

export type IResGetColumn = IUriResponse<IResGetColumnData, IResGetColumnLinks>;
export type IResGetColumnData = t.IColumnData;
export type IResGetColumnLinks = {};

/**
 * File
 */
export type IReqFileParams = { ns: string; file: string };
export type IReqFileQuery = {};
export type IReqFilePullQuery = {};

/**
 * File: GET
 */
export type IResGetFile = IUriResponse<IResGetFileData, IResGetFileLinks>;
export type IResGetFileData = t.IFileData & {};
export type IResGetFileLinks = { file: string; info: string };

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

export type IReqCellsFileParams = IReqCoordParams;
export type IReqCellFileParams = IReqCoordParams & { filename: string };
export type IReqPostCellFileQuery = {
  changes?: boolean; // return list of changes (default: true).
};

export type IResPostCellFile = IUriResponse<IResPostCellFileData, IResPostCellLinks>;
export type IResPostCellFileData = {
  cell: t.ICellData;
  changes?: t.IDbModelChange[];
};
export type IResPostCellLinks = IResGetCellLinks & {};

/**
 * Cell/Files
 */
export type IReqCellFilesParams = IReqCellParams;
export type IReqCellFilesQuery = {};
export type IResGetCellFiles = {
  parent: string;
  uri: string;
  links: IResGetFilesLink[];
};
export type IResGetFilesLink = {
  uri: string;
  name: string;
  file: string;
  info: string;
};

/**
 * Info (System)
 */

export type IResGetInfo = {
  system: string;
  domain: string;
  region: string;
  version: {
    '@platform/cell.http': string;
    '@platform/cell.schema': string;
    '@platform/cell.types': string;
  };
  deployedAt?: {
    datetime: string;
    timestamp: number;
    timezone: string;
  };
};
