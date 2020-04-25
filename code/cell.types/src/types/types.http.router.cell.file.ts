import { t } from '../common';

/**
 * Parameters
 */
export type IUrlParamsCellFiles = t.IUrlParamsCell;
export type IUrlParamsCellFileByName = t.IUrlParamsCell & { filename: string };
export type IUrlParamsCellFileByFileUri = t.IUrlParamsCell & { filename: string };

/**
 * Query
 */
export type IUrlQueryCellFilesList = {
  expires?: string; //  Links expire. Parsable duration, eg "1h", "5m" etc. Max: "1h".
  files?: boolean; //   Show files (default: true).
  urls?: boolean; //    Show URLs (default: true).
};
export type IUrlQueryCellFilesUpload = {
  changes?: boolean; // NB: return list of changes (default: true).
};
export type IUrlQueryCellFilesUploaded = {
  changes?: boolean; // NB: return list of changes (default: true).
};
export type IUrlQueryCellFilesDelete = {};

export type IUrlQueryCellFileInfo = t.IUrlQueryFileInfo & {};
export type IUrlQueryCellFileDownloadByName = t.IUrlQueryCellFileInfo & {
  hash?: string;
  expires?: string; // Parsable duration, eg "1h", "5m" etc. Max: "1h".
};
export type IUrlQueryCellFileDownloadByFileUri = IUrlQueryCellFileDownloadByName;

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
export type IReqPostCellFilesUploadCompleteBody = {};
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
  errors: { error: 'DELETING' | 'UNLINKING' | 'NOT_LINKED'; filename: string }[];
};
