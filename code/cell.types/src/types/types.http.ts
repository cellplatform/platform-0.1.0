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
 * NAMESPACE
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
 * File: POST (upload "start")
 */
export type IResPostFileUploadStart = IResGetFile & {
  upload: t.IFilePresignedUploadUrl;
  changes?: t.IDbModelChange[];
};

/**
 * File: POST (upload "complete")
 */
export type IReqPostFileUploadCompleteBody = {};
export type IResPostFileUploadComplete = IResGetFile & {
  changes?: t.IDbModelChange[];
};

// Used on locally running instances to recieve bindary file data to save.
// When working against S3, this is the cloud end-point (using a presigned-url).
export type IResPostFileUploadLocal = {
  path: string;
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
 * Cell/Files: POST (Upload)
 */
export type IReqPostCellUploadFilesBody = {
  files: Array<{ filename: string; filehash?: string }>;
  seconds?: number; // Expires.
};
export type IReqPostCellUploadFile = {
  filename: string;
  filehash?: string;
};

export type IResPostCellUploadFiles = IUriResponse<
  IResPostCellUploadFilesData,
  IResPostCellUploadFilesUrls
>;
export type IResPostCellUploadFilesData = {
  cell: t.ICellData;
  files: Array<{
    uri: string;
    before: t.IFileData;
    after?: t.IFileData; // NB: This is empty on the "start" and the client fills it in after upload(s) complete.
  }>;
  errors: IResPostCellUploadFilesError[];
  changes?: t.IDbModelChange[];
};
export type IResPostCellUploadFilesError = { status: number; filename: string; message: string };
export type IResPostCellUploadFilesUrls = IResGetCellUrls & {
  uploads: t.IFilePresignedUploadUrl[];
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
