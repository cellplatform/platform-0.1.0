import { t } from '../common';

type Duration = string; // Parsable duration, eg "1h", "5m" etc. Max: "1h".

export type IHttpClientCellFile = {
  readonly path: string;
  exists(): Promise<boolean>;
  info(): t.IHttpClientAsync<t.IResGetFile>;
  download(options?: { expires?: Duration }): t.IHttpClientAsync<ReadableStream | t.Json | string>;
};

export type IHttpClientCellFs = {
  file(path: string): IHttpClientCellFile;
  urls(): t.IHttpClientAsync<IHttpClientCellFileUrl[]>;
  map(): t.IHttpClientAsync<t.IFileMap>;
  list(options?: { filter?: string }): t.IHttpClientAsync<t.IHttpClientFileData[]>;
  upload(
    files: IHttpClientCellFileUpload | IHttpClientCellFileUpload[],
    options?: IHttpClientCellFsUploadOptions,
  ): IHttpClientCellFsUploadPromise;
  delete(filename: string | string[]): t.IHttpClientAsync<t.IResDeleteCellFsData>;
  unlink(filename: string | string[]): t.IHttpClientAsync<t.IResDeleteCellFsData>;
  copy(
    files: t.IHttpClientCellFileCopy | t.IHttpClientCellFileCopy[],
    options?: IHttpClientCellFsCopyOptions,
  ): t.IHttpClientAsync<t.IResPostCellFsCopyData>;
};

export type IHttpClientCellFsUploadOptions = {
  changes?: boolean;
  permission?: t.FsS3Permission;
};

export type IHttpClientCellFsUploadPromise =
  t.IHttpClientAsync<IHttpClientCellFileUploadResponse> & {
    event$: t.Observable<t.IHttpClientUploadedEvent>;
  };

export type IHttpClientCellFsCopyOptions = {
  changes?: boolean;
  permission?: t.FsS3Permission;
};

export type IHttpClientCellFileUrl = {
  uri: string;
  url: string;
  path: string;
  filename: string;
  dir: string;
};

export type IHttpClientCellFileUpload = {
  filename: string;
  data: ArrayBuffer;
  mimetype?: string;
  allowRedirect?: boolean; // Default: true
  's3:permission'?: t.FsS3Permission;
};
export type IHttpClientCellFileUploadResponse = {
  uri: string;
  cell: t.ICellData;
  files: t.IUriData<t.IFileData>[];
  errors: t.IHttpErrorFile[];
  changes?: t.IDbModelChange[];
};

export type IHttpClientCellFileCopy = {
  filename: string; // Source file on cell.
  target: IHttpClientCellFileCopyTarget;
};

export type IHttpClientCellFileCopyTarget = {
  uri: string; //       Cell URI
  host?: string; //     NB: Same as source if ommitted.
  filename?: string; // NB: Same as source if ommitted.
};
