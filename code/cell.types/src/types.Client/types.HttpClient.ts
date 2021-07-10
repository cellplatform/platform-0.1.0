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
 * Static interface
 */
export type HttpClient = {
  create(input?: string | number | t.IHttpClientOptions): t.IHttpClient;
  isClient(input?: any): boolean;
  isReachable(host: string): Promise<boolean>;
};

/**
 * Client (Root)
 */
export type IHttpClient = t.IDisposable & {
  readonly origin: string;
  readonly request$: t.Observable<t.IHttpBefore>;
  readonly response$: t.Observable<t.IHttpAfter>;
  info<T extends t.IResGetSysInfo>(): t.IHttpClientAsync<T>;
  ns(input: string | t.INsUri | t.ICoordUri | t.IFileUri): IHttpClientNs;
  cell(input: string | t.ICellUri): IHttpClientCell;
  file(input: string | t.IFileUri): IHttpClientFile;
  toString(): string;
};

export type IHttpClientOptions = { host?: string | number; http?: t.IHttp };

/**
 * Namespace
 */
export type IHttpClientNs = {
  readonly uri: t.INsUri;
  readonly url: t.IUrlsNs;
  exists(): Promise<boolean>;
  read(options?: t.IReqQueryNsInfo): t.IHttpClientAsync<t.IResGetNs>;
  write(data: t.IReqPostNsBody, options?: t.IReqQueryNsWrite): t.IHttpClientAsync<t.IResPostNs>;
  toString(): string;
};

/**
 * Cell
 */
export type IHttpClientCell = {
  readonly uri: t.ICellUri;
  readonly url: t.IUrlsCell;
  readonly db: t.IHttpClientCellDb;
  readonly fs: t.IHttpClientCellFs;
  readonly links: t.IHttpClientCellLinks;
  exists(): Promise<boolean>;
  info(options?: t.IReqQueryCellInfo): t.IHttpClientAsync<t.IResGetCell>;
  toString(): string;
};

/**
 * File
 */
export type IHttpClientFile = {
  readonly uri: t.IFileUri;
  readonly url: t.IUrlsFile;
  info(): t.IHttpClientAsync<t.IResGetFile>;
  toString(): string;
};

export type IHttpClientFileData = t.IFileData & {
  uri: string;
  filename: string;
  dir: string;
  path: string;
};
