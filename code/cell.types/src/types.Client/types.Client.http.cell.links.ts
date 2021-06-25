import { t } from '../common';
import { ICellUri, INsUri } from '../types.Schema';

export type IHttpClientCellLinks = {
  read(): t.IHttpClientAsync<t.IHttpClientCellLinksInfo>;
  write(
    link: HttpClientCellLinksSet | HttpClientCellLinksSet[],
    options?: t.IReqQueryNsWrite,
  ): t.IHttpClientAsync<t.IResPostNs>;
  delete(key: string | string[], options?: t.IReqQueryNsWrite): t.IHttpClientAsync<t.IResPostNs>;
};
export type HttpClientCellLinksSet = { key: string; value: string };

export type IHttpClientCellLinksInfo = {
  toObject(): t.ICellData['links'];
  readonly list: t.IHttpClientCellLink[];
  readonly files: t.IHttpClientCellLinkFile[];
  readonly cells: t.IHttpClientCellLinkCell[];
  readonly namespaces: t.IHttpClientCellLinkNs[];
};

/**
 * Link types
 */
export type IHttpClientCellLink =
  | IHttpClientCellLinkUnknown
  | IHttpClientCellLinkFile
  | IHttpClientCellLinkCell
  | IHttpClientCellLinkNs;

export type IHttpClientCellLinkUnknown = {
  type: 'UNKNOWN';
  key: string;
  value: string;
};

export type IHttpClientCellLinkFile = {
  type: 'FILE';
  key: string;
  value: string;
  uri: t.IFileUri;
  path: string;
  dir: string;
  name: string;
  hash: string;
  http: t.IHttpClientFile;
};

export type IHttpClientCellLinkCell = {
  type: 'CELL';
  key: string;
  value: string;
  uri: ICellUri;
  http: t.IHttpClientCell;
};

export type IHttpClientCellLinkNs = {
  type: 'NS';
  key: string;
  value: string;
  uri: INsUri;
  http: t.IHttpClientNs;
};
