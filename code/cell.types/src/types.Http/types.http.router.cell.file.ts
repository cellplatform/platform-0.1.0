import { t } from '../common';

type O = Record<string, unknown>;

/**
 * Parameters
 */
export type IUrlParamsCellFs = t.IUrlParamsCell;
export type IUrlParamsCellFileByName = t.IUrlParamsCell & { filename: string };
export type IUrlParamsCellFileByFileUri = t.IUrlParamsCell & { filename: string };

/**
 * Query
 */
export type IReqQueryCellFsList = {
  expires?: string; //  Links expire. Parsable duration, eg "1h", "5m" etc. Max: "1h".
  files?: boolean; //   Show files (default: true).
  urls?: boolean; //    Show URLs (default: true).
  filter?: string; //   Grep style filter pattern.
};
export type IReqQueryCellFsUpload = {
  changes?: boolean; // NB: return list of changes (default: true).
};
export type IReqQueryCellFsUploaded = {
  changes?: boolean; // NB: return list of changes (default: true).
};
export type IReqQueryCellFsDelete = O; // 🐷 Placeholder type.
export type IReqQueryCellFsCopy = {
  changes?: boolean; // NB: return list of changes (default: true).
  's3:permission'?: t.FsS3Permission;
};

export type IReqQueryCellFileInfo = t.IReqQueryFileInfo;
export type IReqQueryCellFileDownloadByName = t.IReqQueryCellFileInfo & {
  hash?: string;
  expires?: string; // Parsable duration, eg "1h", "5m" etc. Max: "1h".
};
export type IReqQueryCellFileDownloadByFileUri = IReqQueryCellFileDownloadByName;

/**
 * GET: Cell Files
 */
export type IResGetCellFs = {
  total: number;
  uri: string;
  urls?: {
    cell: string;
    files: IResGetCellFsFileUrl[];
  };
  files?: t.IFileMap;
};
export type IResGetCellFsFileUrl = {
  uri: string;
  path: string;
  url: string;
  'url:latest': string;
};

/**
 * POST: Cell Files (Upload Start)
 */
export type IReqPostCellFsUploadStartBody = {
  files: IReqPostCellUploadFile[];
  expires?: string; // Parsable duration, eg "1h", "5m" etc. Max: "1h".
};
export type IReqPostCellUploadFile = {
  filename: string;
  filehash?: string;
  mimetype?: string;
  allowRedirect?: boolean;
  's3:permission'?: t.FsS3Permission;
};

export type IResPostCellFsUploadStart = t.IUriResponse<
  IResPostCellFsUploadStartData,
  IResPostCellFsUploadUrls
>;
export type IResPostCellFsUploadStartData = {
  cell: t.ICellData;
  files: t.IUriData<t.IFileData>[];
  errors: t.IFileUploadError[];
  changes?: t.IDbModelChange[];
};
export type IResPostCellFsUploadUrls = t.IResGetCellUrls & {
  uploads: t.IFilePresignedUploadUrl[];
};

/**
 * POST: Cell Files (Upload Complete)
 */
export type IReqPostCellFsUploadCompleteBody = O; // 🐷 Placeholder type.
export type IResPostCellFsUploadComplete = t.IUriResponse<IResPostCellFsUploadCompleteData>;
export type IResPostCellFsUploadCompleteData = {
  cell: t.ICellData;
  files: t.IUriData<t.IFileData>[];
  changes?: t.IDbModelChange[];
};

/**
 * DELETE: Cell Files
 */
export type IReqDeleteCellFsBody = {
  filenames: string[];
  action: 'DELETE' | 'UNLINK';
};
export type IResDeleteCellFs = t.IUriResponse<IResDeleteCellFsData>;
export type IResDeleteCellFsData = {
  uri: string;
  deleted: string[];
  unlinked: string[];
  errors: IResDeleteCellFsError[];
};
export type IResDeleteCellFsError = {
  filename: string;
  error: 'DELETING' | 'UNLINKING' | 'NOT_LINKED';
  message: string;
};

/**
 * POST: Copy Files
 */
export type IReqPostCellFsCopyBody = {
  files: t.IHttpClientCellFileCopy[];
};
export type IResPostCellFsCopy = t.IUriResponse<IResPostCellFsCopyData>;
export type IResPostCellFsCopyData = {
  files: IResPostCellFileCopyItem[];
  errors: IResPostCellFsCopyError[];
  changes?: t.IDbModelChange[];
};
export type IResPostCellFsCopyError = {
  file: t.IHttpClientCellFileCopy;
  message: string;
};

export type IResPostCellFileCopyItem = {
  target: IResPostCellFileCopyAddress;
  source: IResPostCellFileCopyAddress;
};
export type IResPostCellFileCopyAddress = {
  host: string;
  cell: string; // cell:uri
  file: string; // file:uri
  filename: string;
  status: 'EXISTING' | 'NEW';
};
