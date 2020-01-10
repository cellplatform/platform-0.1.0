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
export type IResGetNs = IUriResponse<IResGetNsData, IResGetNsUrls>;
export type IResGetNsData = { ns: t.INs } & Partial<t.INsDataChildren>;
export type IResGetNsUrls = { data: string };

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

export type IResGetCell = IUriResponse<IResGetCellData, IResGetCellUrls>;
export type IResGetCellData = t.ICellData;
export type IResGetCellUrls = { cell: string; files: string };

export type IResGetRow = IUriResponse<IResGetRowData, IResGetRowUrls>;
export type IResGetRowData = t.IRowData;
export type IResGetRowUrls = {};

export type IResGetColumn = IUriResponse<IResGetColumnData, IResGetColumnUrls>;
export type IResGetColumnData = t.IColumnData;
export type IResGetColumnUrls = {};

/**
 * File: GET
 */
export type IResGetFile = IUriResponse<IResGetFileData, IResGetFileUrls>;
export type IResGetFileData = t.IFileData & {};
export type IResGetFileUrls = { info: string; download: string };

/**
 * File: POST (upload)
 */
export type IReqPostFileBody = {};
export type IResPostFile = IResGetFile & {
  upload: t.IFileUploadUrl;
  changes?: t.IDbModelChange[];
};

export type IResPostFileUploadLocal = {
  path: string;
};

/**
 * File: POST (verify)
 */
export type IReqPostFileVerifiedBody = { overwrite?: boolean };
export type IResPostFileVerified = IResGetFile & {
  isValid: boolean;
  changes?: t.IDbModelChange[];
};

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
export type IReqPostCellFilesBody = {
  files: Array<{ filename: string; filehash?: string }>;
  seconds?: number; // Expires.
};
export type IReqPostCellFile = {
  filename: string;
  filehash?: string;
};

export type IResPostCellFiles = IUriResponse<IResPostCellFilesData, IResPostCellFilesUrls>;
export type IResPostCellFilesData = {
  cell: t.ICellData;
  errors: IResPostCellFilesError[];
  changes?: t.IDbModelChange[];
};
export type IResPostCellFilesError = { status: number; filename: string; message: string };
export type IResPostCellFilesUrls = IResGetCellUrls & {
  uploads: t.IFileUploadUrl[];
};

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
