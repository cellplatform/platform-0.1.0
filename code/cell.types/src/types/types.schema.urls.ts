import { t } from '../common';

export type IUrls = {
  readonly protocol: t.HttpProtocol;
  readonly host: string;
  readonly port: number;
  readonly origin: string;
  readonly sys: IUrlsSys;
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
  info: t.IUrl;
};

export type IUrlsCell = {
  uri: string;
  info: t.IUrl<t.IUrlQueryGetCell>;
  files: IUrlsCellFiles;
  file: IUrlsCellFile;
};

export type IUrlsCellFile = {
  byName(filename: string): t.IUrl<t.IUrlQueryGetCellFileByName>;
  byIndex(index: number | string): t.IUrl<t.IUrlQueryGetCellFileByIndex>;
};

export type IUrlsCellFiles = {
  list: t.IUrl<t.IUrlQueryGetCellFiles>;
  upload: t.IUrl<t.IUrlQueryUploadCellFiles>;
  delete: t.IUrl<t.IUrlQueryDeleteCellFiles>;
};

export type IUrlsRow = {
  uri: string;
  info: t.IUrl<t.IUrlQueryGetRow>;
};

export type IUrlsColumn = {
  uri: string;
  info: t.IUrl<t.IUrlQueryGetColumn>;
};

export type IUrlsFile = {
  uri: string;
  info: t.IUrl<t.IUrlQueryGetFileInfo>;
  upload: t.IUrl<t.IUrlQueryPostFile>;
  download: t.IUrl<t.IUrlQueryGetFile>;
  delete: t.IUrl<t.IUrlQueryDeleteFile>;
};
