import { t } from '../common';

export type HttpProtocol = 'http' | 'https';

export type IClientResponse<T> = {
  ok: boolean;
  status: number;
  body: T;
  error?: t.IHttpError;
};
