import { t, IDuration } from './common';

export type HttpRespondInput =
  | t.IHttpRespondPayload
  | (() => t.IHttpRespondPayload)
  | (() => Promise<t.IHttpRespondPayload>);

export type IHttpModify = {
  header(key: string, value: string): void;
  headers: {
    merge(headers: t.IHttpHeaders): void;
    replace(headers: t.IHttpHeaders): void;
  };
};

/**
 * Events
 */
export type HttpEvent = IHttpBeforeEvent | IHttpAfterEvent;

export type IHttpBeforeEvent = { type: 'HTTP/before'; payload: IHttpBefore };
export type IHttpBefore = {
  uid: string;
  method: t.HttpMethod;
  url: string;
  data?: any;
  headers: t.IHttpHeaders;
  isModified: boolean;
  modify: t.IHttpModify;
  respond(payload: HttpRespondInput): void; // NB: Used for mocking/testing or providing alternative `fetch` implementations.
};

export type IHttpAfterEvent = { type: 'HTTP/after'; payload: IHttpAfter };
export type IHttpAfter = {
  uid: string;
  method: t.HttpMethod;
  url: string;
  response: t.IHttpResponse;
  elapsed: IDuration;
};
