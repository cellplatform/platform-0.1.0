import { t } from '../common';
import { ICellUri, INsUri } from '../types.Schema';

/**
 * Cell Links
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
