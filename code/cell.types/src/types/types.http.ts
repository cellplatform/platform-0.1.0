import { t } from '../common';

export type HttpProtocol = 'http' | 'https';

/**
 * Configuration
 */

export type IHttpConfigFileArgs = { path?: string; throw?: boolean };
export type IHttpConfigFile = {
  path: string;
  exists: boolean;
  data: IHttpConfigDeployment;
  validate(): IHttpConfigValidation;
};
export type IHttpConfigValidation = {
  isValid: boolean;
  errors: t.IError[];
};

export type IHttpConfigDeployment = {
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

export type IHttpConfigNowFile = {
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
export type IUriResponse<D, L extends IUrlMap = {}> = {
  uri: string;
  exists: boolean;
  createdAt: number;
  modifiedAt: number;
  data: D;
  urls: L;
};

export type IUrlMap = { [key: string]: string };

/**
 * Namespace
 */

/**
 * Namespace: GET
 */
export type IResGetNs = IUriResponse<IResGetNsData, IResGetNsLinks>;
export type IResGetNsData = { ns: t.INs } & Partial<t.INsDataChildren>;
export type IResGetNsLinks = { data: string };

/**
 * Namespace: POST
 */

export type IReqPostNsBody = {
  ns?: Partial<t.INsProps>;
  cells?: t.ICellMap;
  columns?: t.IColumnMap;
  rows?: t.IRowMap;
  calc?: boolean | string | Array<string | boolean>; // Perform calcuations (default: false), if string key/range of cells to calculate, eg "A1", "A1:C10"
};
export type IResPostNs = IResGetNs & { changes?: t.IDbModelChange[] };

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
 * File (info / meta-data)
 */
export type IReqFileInfoQuery = {};

/**
 * File: GET
 */
export type IResGetFile = IUriResponse<IResGetFileData, IResGetFileLinks>;
export type IResGetFileData = t.IFileData & {};
export type IResGetFileLinks = { info: string; download: string };

/**
 * File: POST
 */
export type IReqPostFileBody = {};
export type IResPostFile = IResGetFile & { changes?: t.IDbModelChange[] };

/**
 * File: DELETE
 */
export type IResDeleteFile = { uri: string; deleted: boolean };

/**
 * Cell/Files: GET
 */
export type IResGetCellFiles = {
  cell: string;
  uri: string;
  urls: IUrlMap;
  files: t.IFileMap;
};

/**
 * Cell/Files: POST
 */
export type IResPostCellFiles = IUriResponse<IResPostCellFilesData, IResPostCellLinks>;
export type IResPostCellFilesData = {
  cell: t.ICellData;
  errors: IResPostCellFilesError[];
  changes?: t.IDbModelChange[];
};
export type IResPostCellFilesError = { status: number; filename: string; message: string };
export type IResPostCellLinks = IResGetCellLinks & {};

/**
 * Cell/Files: DELETE
 */
export type IReqDeleteCellFilesBody = {
  filenames: string[];
  action: 'DELETE' | 'UNLINK';
};
export type IResDeleteCellFiles = IUriResponse<IResDeleteCellFilesData>;
export type IResDeleteCellFilesData = {
  uri: string;
  deleted: string[];
  unlinked: string[];
  errors: Array<{ error: 'DELETING' | 'UNLINKING' | 'NOT_LINKED'; filename: string }>;
};

/**
 * Info (System)
 */

export type IResGetSysInfo = {
  system: string;
  domain: string;
  region: string;
  time: string;
  version: {
    hash: string;
    schema: string;
    types: string;
    server: string;
  };
  deployedAt?: {
    datetime: string;
    timestamp: number;
  };
};
