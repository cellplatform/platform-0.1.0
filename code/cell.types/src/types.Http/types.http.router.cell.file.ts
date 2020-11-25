import { t } from '../common';

type O = Record<string, unknown>;

/**
 * Parameters
 */
export type IUrlParamsCellFiles = t.IUrlParamsCell;
export type IUrlParamsCellFileByName = t.IUrlParamsCell & { filename: string };
export type IUrlParamsCellFileByFileUri = t.IUrlParamsCell & { filename: string };

/**
 * Query
 */
export type IReqQueryCellFilesList = {
  expires?: string; //  Links expire. Parsable duration, eg "1h", "5m" etc. Max: "1h".
  files?: boolean; //   Show files (default: true).
  urls?: boolean; //    Show URLs (default: true).
  filter?: string; //   Grep style filter pattern.
};
export type IReqQueryCellFilesUpload = {
  changes?: boolean; // NB: return list of changes (default: true).
};
export type IReqQueryCellFilesUploaded = {
  changes?: boolean; // NB: return list of changes (default: true).
};
export type IReqQueryCellFilesDelete = O; // 🐷 Placeholder type.
export type IReqQueryCellFilesCopy = {
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
 * POST: Cell Files (Upload Start)
 */
export type IReqPostCellFilesUploadStartBody = {
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

export type IResPostCellFilesUploadStart = t.IUriResponse<
  IResPostCellFilesUploadStartData,
  IResPostCellFilesUploadUrls
>;
export type IResPostCellFilesUploadStartData = {
  cell: t.ICellData;
  files: t.IUriData<t.IFileData>[];
  errors: t.IFileUploadError[];
  changes?: t.IDbModelChange[];
};
export type IResPostCellFilesUploadUrls = t.IResGetCellUrls & {
  uploads: t.IFilePresignedUploadUrl[];
};

/**
 * POST: Cell Files (Upload Complete)
 */
export type IReqPostCellFilesUploadCompleteBody = O; // 🐷 Placeholder type.
export type IResPostCellFilesUploadComplete = t.IUriResponse<IResPostCellFilesUploadCompleteData>;
export type IResPostCellFilesUploadCompleteData = {
  cell: t.ICellData;
  files: t.IUriData<t.IFileData>[];
  changes?: t.IDbModelChange[];
};

/**
 * DELETE: Cell Files
 */
export type IReqDeleteCellFilesBody = {
  filenames: string[];
  action: 'DELETE' | 'UNLINK';
};
export type IResDeleteCellFiles = t.IUriResponse<IResDeleteCellFilesData>;
export type IResDeleteCellFilesData = {
  uri: string;
  deleted: string[];
  unlinked: string[];
  errors: IResDeleteCellFilesError[];
};
export type IResDeleteCellFilesError = {
  filename: string;
  error: 'DELETING' | 'UNLINKING' | 'NOT_LINKED';
  message: string;
};

/**
 * POST: Copy Files
 */
export type IReqPostCellFilesCopyBody = {
  files: t.IHttpClientCellFileCopy[];
};
export type IResPostCellFilesCopy = t.IUriResponse<IResPostCellFilesCopyData>;
export type IResPostCellFilesCopyData = {
  files: IResPostCellFileCopyItem[];
  errors: IResPostCellFilesCopyError[];
  changes?: t.IDbModelChange[];
};
export type IResPostCellFilesCopyError = {
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
