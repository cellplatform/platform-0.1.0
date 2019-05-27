export type IHttpHeaders = { [key: string]: string | number };

export type IFetchOptions = { headers?: IHttpHeaders; mode?: 'cors' | 'no-cors' | 'same-origin' };

export type IHttpResponse<B = string> = {
  status: number;
  statusText: string;
  ok: boolean;
  headers: IHttpHeaders;
  body: B;
};
