import { t } from './common';

/**
 * Request
 */
export type IHttpRequestPayload = {
  url: string;
  method: t.HttpMethod;
  mode?: t.HttpCors;
  headers?: t.IHttpHeaders;
  data?: object | string;
};

export type HttpFetch = (req: IHttpRequestPayload) => Promise<t.IHttpRespondPayload>;
