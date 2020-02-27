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
export type IResGetNsData = Partial<t.INsDataChildren> & {
  ns: t.INs;
  total?: Partial<t.INsTotals>;
};
export type IResGetNsUrls = { data: string };
export type IResGetNsTypes = {
  uri: string;
  types: t.ITypeDef[];
  typescript: string;
};

/**
 * Namespace: POST
 */

export type IReqPostNsBody = {
  ns?: Partial<t.INsProps>;
  cells?: t.ICellMap<any>;
  columns?: t.IColumnMap<any>;
  rows?: t.IRowMap<any>;
  calc?: boolean | string | (string | boolean)[]; // Perform calcuations (default: false), if string key/range of cells to calculate, eg "A1", "A1:C10"
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
  total: number;
  uri: string;
  urls?: {
    cell: string;
    files: IResGetCellFilesFileUrl[];
  };
  files?: t.IFileMap;
};
export type IResGetCellFilesFileUrl = {
  uri: string;
  path: string;
  url: string;
  'url:latest': string;
};

/**
 * Cell/Files: POST (Upload Start)
 */
export type IReqPostCellFilesUploadStartBody = {
  files: IReqPostCellUploadFile[];
  expires?: string; // Parsable duration, eg "1h", "5m" etc. Max: "1h".
};
export type IReqPostCellUploadFile = {
  filename: string;
  filehash?: string;
  mimetype?: string;
};

export type IResPostCellFilesUploadStart = IUriResponse<
  IResPostCellFilesUploadStartData,
  IResPostCellFilesUploadUrls
>;
export type IResPostCellFilesUploadStartData = {
  cell: t.ICellData;
  files: t.IUriData<t.IFileData>[];
  errors: t.IFileUploadError[];
  changes?: t.IDbModelChange[];
};
export type IResPostCellFilesUploadUrls = IResGetCellUrls & {
  uploads: t.IFilePresignedUploadUrl[];
};

/**
 * Cell/Files: POST (Upload Complete)
 */
export type IReqPostCellFilesUploadCompleteBody = {};
export type IResPostCellFilesUploadComplete = IUriResponse<IResPostCellFilesUploadCompleteData>;
export type IResPostCellFilesUploadCompleteData = {
  cell: t.ICellData;
  files: t.IUriData<t.IFileData>[];
  changes?: t.IDbModelChange[];
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
  errors: { error: 'DELETING' | 'UNLINKING' | 'NOT_LINKED'; filename: string }[];
};

/**
 * Info (System)
 */

export type IResGetSysInfo = {
  provider: string;
  system: string;
  host: string;
  region: string;
  deployed?: string;
};

export type IResGetSysUid = string[];
