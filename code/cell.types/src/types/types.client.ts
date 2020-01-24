import { t } from '../common';

/**
 * Response.
 */
export type ClientBodyType = 'JSON' | 'TEXT' | 'BINARY';
export type IClientAsync<T> = Promise<IClientResponse<T>>;
export type IClientResponse<T> = {
  ok: boolean;
  status: number;
  body: T;
  bodyType: ClientBodyType;
  error?: t.IHttpError;
};

/**
 * ROOT (CLIENT)
 */
export type IClient = {
  readonly origin: string;
  request$: t.Observable<t.IHttpBefore>;
  response$: t.Observable<t.IHttpAfter>;

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
  info(): t.IClientAsync<t.IResGetCell>;
  links(): t.IClientAsync<IClientCellLinks>;
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
  info(): t.IClientAsync<t.IResGetFile>;
  download(options?: {
    expires?: string; // Parsable duration, eg "1h", "5m" etc. Max: "1h".
  }): t.IClientAsync<ReadableStream | string>;
};

export type IClientCellFiles = {
  urls(): t.IClientAsync<IClientCellFileUrl[]>;
  map(): t.IClientAsync<t.IFileMap>;
  list(): t.IClientAsync<IClientFileData[]>;
  upload(
    files: IClientCellFileUpload | IClientCellFileUpload[],
    options?: { changes?: boolean },
  ): t.IClientAsync<IClientCellFileUploadResponse>;
  delete(filename: string | string[]): t.IClientAsync<t.IResDeleteCellFilesData>;
  unlink(filename: string | string[]): t.IClientAsync<t.IResDeleteCellFilesData>;
};
export type IClientCellFileUpload = { filename: string; data: ArrayBuffer; mimetype?: string };
export type IClientCellFileUrl = {
  uri: string;
  url: string;
  path: string;
  filename: string;
  dir: string;
};

export type IClientCellFileUploadResponse = {
  uri: string;
  cell: t.ICellData;
  files: Array<t.IUriData<t.IFileData>>;
  errors: t.IFileUploadError[];
  changes?: t.IDbModelChange[];
};

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
  dir: string;
  path: string;
  hash: string;
  file: IClientFile;
};

/**
 * FILE
 */
export type IClientFile = {
  readonly uri: t.IUriParts<t.IFileUri>;
  readonly url: t.IUrlsFile;
  info(): t.IClientAsync<t.IResGetFile>;
};

export type IClientFileData = t.IFileData & {
  uri: string;
  filename: string;
  dir: string;
  path: string;
};
