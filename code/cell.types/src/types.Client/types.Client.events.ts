import { t } from '../common';

export type HttpClientEvent = IHttpClientUploadedEvent;

/**
 * Fires during an upload sequence.
 */
export type IHttpClientUploadedEvent = {
  type: 'HttpClient/uploaded';
  payload: IHttpClientUploaded;
};

export type IHttpClientUploaded = {
  tx: string; // Operation transaction id.
  uri: string;
  file?: { filename: string; uri: string };
  error?: t.IFileUploadError;
  total: number;
  completed: number;
  done: boolean;
};
