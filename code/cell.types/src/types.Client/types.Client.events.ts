import { t } from '../common';

export type HttpClientEvent = IHttpClientUploadEvent;

/**
 * Fires during an upload sequence.
 */
export type IHttpClientUploadEvent = {
  type: 'HttpClient/upload';
  payload: IHttpClientUpload;
};

export type IHttpClientUpload = {
  tx: string; // ID of the upload transaction.
  files: t.IHttpClientCellFileUpload[];
};
