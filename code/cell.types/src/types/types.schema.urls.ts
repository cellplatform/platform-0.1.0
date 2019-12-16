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
  files: t.IUrl<t.IUrlQueryGetCellFiles>;
  file: {
    byName(filename: string): t.IUrl<t.IUrlQueryGetCellFileByName>;
    byIndex(index: number | string): t.IUrl<t.IUrlQueryGetCellFileByIndex>;
  };
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
  download: t.IUrl<t.IUrlQueryGetFile>;
  info: t.IUrl<t.IUrlQueryGetFileInfo>;
};
