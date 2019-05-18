export type IHttpHeaders = { [key: string]: string | number };

export type IFetchOptions = { headers?: IHttpHeaders };

export type IHttpResponse<B = string> = {
  status: number;
  statusText: string;
  ok: boolean;
  headers: IHttpHeaders;
  body: B;
};
