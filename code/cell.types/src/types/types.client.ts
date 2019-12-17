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
  cell(input: string | t.IUrlParamsCell): IClientCell;
  file(input: string | t.IUrlParamsFile): IClientFile;
};

/**
 * CELL
 */
export type IClientCell = {
  readonly uri: t.IUriParts<t.ICellUri>;
  readonly url: t.IUrlsCell;
  readonly file: IClientCellFile;
  info(): t.IClientResponseAsync<t.IResGetCell>;
  links(): t.IClientResponseAsync<IClientCellLinks>;
  files(): t.IClientResponseAsync<IClientCellFiles>;
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
  upload(data: ArrayBuffer): t.IClientResponseAsync<t.IResPostCellFile>;
  download(): t.IClientResponseAsync<ReadableStream>;
};

export type IClientCellFiles = {
  map: t.IFileMap;
  list: Array<t.IFileData & { uri: string }>;
};

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
