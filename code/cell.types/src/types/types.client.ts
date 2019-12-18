import { t } from '../common';

/**
 * Response.
 */
export type IClientResponseAsync<T> = Promise<IClientResponse<T>>;
export type IClientResponse<T> = {
  ok: boolean;
  status: number;
  body: T;
  error?: t.IHttpError;
};

/**
 * ROOT (CLIENT)
 */
export type IClient = {
  readonly origin: string;
  ns(input: string | t.IUrlParamsNs): IClientNs;
  cell(input: string | t.IUrlParamsCell): IClientCell;
  file(input: string | t.IUrlParamsFile): IClientFile;
};

/**
 * NAMESPSACE
 */
export type IClientNs = {
  readonly uri: t.IUriParts<t.INsUri>;
  readonly url: t.IUrlsNs;
};

/**
 * CELL
 */
export type IClientCell = {
  readonly uri: t.IUriParts<t.ICellUri>;
  readonly url: t.IUrlsCell;
  readonly file: IClientCellFile;
  readonly files: IClientCellFiles;
  info(): t.IClientResponseAsync<t.IResGetCell>;
  links(): t.IClientResponseAsync<IClientCellLinks>;
};

export type IClientCellLinks = {
  readonly list: IClientCellLink[];
  readonly files: IClientCellLinkFile[];
  toObject(): t.ICellData['links'];
};

export type IClientCellFile = {
  name(filename: string): IClientCellFileByName;
};

export type IClientCellFileByName = {
  info(): t.IClientResponseAsync<t.IResGetFile>;
  upload(data: ArrayBuffer): t.IClientResponseAsync<t.IResPostCellFile>; // TEMP 🐷
  download(): t.IClientResponseAsync<ReadableStream>;
};

export type IClientCellFiles = {
  map(): t.IClientResponseAsync<t.IFileMap>;
  list(): t.IClientResponseAsync<IClientFileData[]>;
  upload(files: IClientCellFileUpload[]): t.IClientResponseAsync<t.IResPostCellFiles>;
};
export type IClientCellFileUpload = { filename: string; data: ArrayBuffer };

/**
 * Cell Links
 */
export type IClientCellLink = IClientCellLinkUnknown | IClientCellLinkFile;

export type IClientCellLinkUnknown = {
  type: 'UNKNOWN';
  key: string;
  uri: string;
};

export type IClientCellLinkFile = {
  type: 'FILE';
  key: string;
  uri: string;
  filename: string;
  hash: string;
  file: IClientFile;
};

/**
 * FILE
 */
export type IClientFile = {
  readonly uri: t.IUriParts<t.IFileUri>;
  readonly url: t.IUrlsFile;
  info(): t.IClientResponseAsync<t.IResGetFile>;
  upload(args: { filename: string; data: ArrayBuffer }): t.IClientResponseAsync<t.IResPostFile>;
};

export type IClientFileData = t.IFileData & { uri: string };
