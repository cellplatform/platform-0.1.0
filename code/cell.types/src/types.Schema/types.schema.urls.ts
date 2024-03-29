import { t } from '../common';

export type IUrls = {
  readonly protocol: t.HttpProtocol;
  readonly host: string;
  readonly hostname: string;
  readonly port: number;
  readonly origin: string;
  readonly sys: IUrlsSys;
  readonly local: IUrlsLocal;
  readonly fn: IUrlsFunc;
  ns(input: string | t.INsUri): IUrlsNs;
  cell(input: string | t.ICellUri): IUrlsCell;
  row(input: string | t.IRowUri): IUrlsRow;
  column(input: string | t.IColumnUri): IUrlsColumn;
  file(input: string | t.IFileUri): IUrlsFile;
};

export type IUrlsSys = {
  info: t.IUrl<t.IReqQuerySysInfo>;
  uid: t.IUrl<t.IReqQuerySysUid>;
};

export type IUrlsFunc = {
  run: t.IUrl<t.IReqQueryFunc>;
  bundle: IUrlsBundle;
};

export type IUrlsBundle = {
  manifest(bundle: t.BundleCellAddress): t.IUrl<t.IReqQueryCellFileDownloadByName>;
  files(bundle: t.BundleCellAddress): t.IUrl<t.IReqQueryCellFsList>;
};

export type IUrlsNs = {
  uri: string;
  info: t.IUrl<t.IReqQueryNsInfo>;
};

export type IUrlsCell = {
  uri: string;
  info: t.IUrl<t.IReqQueryCellInfo>;
  files: IUrlsCellFiles;
  file: IUrlsCellFile;
};

export type IUrlsCellFile = {
  toString(): string;
  byFileUri(fileUri: string, fileExtension?: string): t.IUrl<t.IReqQueryCellFileDownloadByName>;
  byName(filename: string): t.IUrl<t.IReqQueryCellFileDownloadByName>;
};

export type IUrlsCellFiles = {
  list: t.IUrl<t.IReqQueryCellFsList>;
  upload: t.IUrl<t.IReqQueryCellFsUpload>;
  uploaded: t.IUrl<t.IReqQueryCellFsUploaded>;
  delete: t.IUrl<t.IReqQueryCellFsDelete>;
  copy: t.IUrl<t.IReqQueryCellFsCopy>;
};

export type IUrlsRow = {
  uri: string;
  info: t.IUrl<t.IReqQueryRowInfo>;
};

export type IUrlsColumn = {
  uri: string;
  info: t.IUrl<t.IReqQueryColumnInfo>;
};

export type IUrlsFile = {
  uri: string;
  info: t.IUrl<t.IReqQueryFileInfo>;
  download: t.IUrl<t.IReqQueryFileDownload>;
  delete: t.IUrl<t.IReqQueryFileDelete>;
  uploaded: t.IUrl<t.IReqQueryFileUploadComplete>;
};

/**
 * Special URLs only available when running on [localhost]
 * NB:
 *    These allow calls to external systems (eg "S3") to be simulated.
 */
export type IUrlsLocal = {
  fs: t.IUrl<t.IReqQueryLocalFs>;
};
