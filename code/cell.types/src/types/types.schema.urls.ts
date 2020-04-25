import { t } from '../common';

export type IUrl<Q extends object = {}> = {
  readonly origin: string;
  readonly path: string;
  readonly querystring: string;
  query(input: Partial<Q>): IUrl<Q>;
  toString(options?: { origin?: boolean }): string;
};



export type IUrls = {
  readonly protocol: t.HttpProtocol;
  readonly host: string;
  readonly port: number;
  readonly origin: string;
  readonly sys: IUrlsSys;
  readonly local: IUrlsLocal;
  ns(input: string | t.IUrlParamsNs): IUrlsNs;
  cell(input: string | t.IUrlParamsCell): IUrlsCell;
  row(input: string | t.IUrlParamsRow): IUrlsRow;
  column(input: string | t.IUrlParamsColumn): IUrlsColumn;
  file(input: string | t.IUrlParamsFile): IUrlsFile;
};

export type IUrlsSys = {
  info: t.IUrl;
  uid: t.IUrl;
};

export type IUrlsNs = {
  uri: string;
  info: t.IUrl<t.IUrlQueryNsInfo>;
};

export type IUrlsCell = {
  uri: string;
  info: t.IUrl<t.IUrlQueryCellInfo>;
  files: IUrlsCellFiles;
  file: IUrlsCellFile;
};

export type IUrlsCellFile = {
  byFileUri(fileUri: string, fileExtension?: string): t.IUrl<t.IUrlQueryCellFileDownloadByName>;
  byName(filename: string): t.IUrl<t.IUrlQueryCellFileDownloadByName>;
};

export type IUrlsCellFiles = {
  list: t.IUrl<t.IUrlQueryCellFilesList>;
  upload: t.IUrl<t.IUrlQueryCellFilesUpload>;
  uploaded: t.IUrl<t.IUrlQueryCellFilesUploaded>;
  delete: t.IUrl<t.IUrlQueryCellFilesDelete>;
};

export type IUrlsRow = {
  uri: string;
  info: t.IUrl<t.IUrlQueryRowInfo>;
};

export type IUrlsColumn = {
  uri: string;
  info: t.IUrl<t.IUrlQueryColumnInfo>;
};

export type IUrlsFile = {
  uri: string;
  info: t.IUrl<t.IUrlQueryFileInfo>;
  download: t.IUrl<t.IUrlQueryFileDownload>;
  delete: t.IUrl<t.IUrlQueryFileDelete>;
  uploaded: t.IUrl<t.IUrlQueryFileUploadComplete>;
};

/**
 * Special URLs only available when running on [localhost]
 * NB:
 *    These allow calls to external systems (eg "S3") to be simulated.
 */
export type IUrlsLocal = {
  fs: t.IUrl<t.IUrlQueryLocalFs>;
};
