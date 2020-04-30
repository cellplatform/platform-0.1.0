import { t } from '../common';

/**
 * Response.
 */
export type HttpClientBodyType = 'JSON' | 'TEXT' | 'BINARY';
export type IHttpClientAsync<T> = Promise<IHttpClientResponse<T>>;
export type IHttpClientResponse<T> = {
  ok: boolean;
  status: number;
  body: T;
  bodyType: HttpClientBodyType;
  error?: t.IHttpError;
};

/**
 * ROOT (CLIENT)
 */
export type IHttpClient = {
  readonly origin: string;
  request$: t.Observable<t.IHttpBefore>;
  response$: t.Observable<t.IHttpAfter>;

  info<T extends t.IResGetSysInfo>(): t.IHttpClientAsync<T>;
  ns(input: string | t.INsUri): IHttpClientNs;
  cell(input: string | t.ICellUri): IHttpClientCell;
  file(input: string | t.IFileUri): IHttpClientFile;
};

export type IHttpClientOptions = { host?: string | number; http?: t.IHttp };

/**
 * NAMESPSACE
 */
export type IHttpClientNs = {
  readonly uri: t.INsUri;
  readonly url: t.IUrlsNs;
  exists(): Promise<boolean>;
  read(options?: t.IReqQueryNsInfo): t.IHttpClientAsync<t.IResGetNs>;
  write(data: t.IReqPostNsBody, options?: t.IReqQueryNsWrite): t.IHttpClientAsync<t.IResPostNs>;
};

/**
 * CELL
 */
export type IHttpClientCell = {
  readonly uri: t.ICellUri;
  readonly url: t.IUrlsCell;
  readonly file: IHttpClientCellFile;
  readonly files: IHttpClientCellFiles;
  exists(): Promise<boolean>;
  info(options?: t.IReqQueryCellInfo): t.IHttpClientAsync<t.IResGetCell>;
  links(): t.IHttpClientAsync<IHttpClientCellLinks>;
};

export type IHttpClientCellLinks = {
  readonly list: IHttpClientCellLink[];
  readonly files: IHttpClientCellLinkFile[];
  toObject(): t.ICellData['links'];
};

export type IHttpClientCellFile = {
  name(path: string): IHttpClientCellFileByName;
};

export type IHttpClientCellFileByName = {
  info(): t.IHttpClientAsync<t.IResGetFile>;
  download(options?: {
    expires?: string; // Parsable duration, eg "1h", "5m" etc. Max: "1h".
  }): t.IHttpClientAsync<ReadableStream | string>;
};

export type IHttpClientCellFiles = {
  urls(): t.IHttpClientAsync<IHttpClientCellFileUrl[]>;
  map(): t.IHttpClientAsync<t.IFileMap>;
  list(): t.IHttpClientAsync<IHttpClientFileData[]>;
  upload(
    files: IHttpClientCellFileUpload | IHttpClientCellFileUpload[],
    options?: { changes?: boolean },
  ): t.IHttpClientAsync<IHttpClientCellFileUploadResponse>;
  delete(filename: string | string[]): t.IHttpClientAsync<t.IResDeleteCellFilesData>;
  unlink(filename: string | string[]): t.IHttpClientAsync<t.IResDeleteCellFilesData>;
};
export type IHttpClientCellFileUpload = { filename: string; data: ArrayBuffer; mimetype?: string };
export type IHttpClientCellFileUrl = {
  uri: string;
  url: string;
  path: string;
  filename: string;
  dir: string;
};

export type IHttpClientCellFileUploadResponse = {
  uri: string;
  cell: t.ICellData;
  files: t.IUriData<t.IFileData>[];
  errors: t.IFileUploadError[];
  changes?: t.IDbModelChange[];
};

/**
 * Cell Links
 */
export type IHttpClientCellLink = IHttpClientCellLinkUnknown | IHttpClientCellLinkFile;

export type IHttpClientCellLinkUnknown = {
  type: 'UNKNOWN';
  key: string;
  uri: string;
};

export type IHttpClientCellLinkFile = {
  type: 'FILE';
  key: string;
  uri: string;
  path: string;
  dir: string;
  name: string;
  hash: string;
  file: IHttpClientFile;
};

/**
 * FILE
 */
export type IHttpClientFile = {
  readonly uri: t.IFileUri;
  readonly url: t.IUrlsFile;
  info(): t.IHttpClientAsync<t.IResGetFile>;
};

export type IHttpClientFileData = t.IFileData & {
  uri: string;
  filename: string;
  dir: string;
  path: string;
};
