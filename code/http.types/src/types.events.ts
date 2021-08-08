import { t, IDuration } from './common';

export type HttpRespondInput =
  | t.HttpRespondPayload
  | (() => t.HttpRespondPayload)
  | (() => Promise<t.HttpRespondPayload>);

export type HttpModify = {
  header(key: string, value: string): void;
  headers: {
    merge(headers: t.HttpHeaders): void;
    replace(headers: t.HttpHeaders): void;
  };
};

/**
 * Events
 */
export type HttpEvent = HttpBeforeEvent | HttpAfterEvent;

export type HttpBeforeEvent = {
  type: 'HTTP/before';
  payload: HttpBefore;
};
export type HttpBefore = {
  tx: string;
  method: t.HttpMethod;
  url: string;
  data?: any;
  headers: t.HttpHeaders;
  isModified: boolean;
  modify: t.HttpModify;
  respond(payload: HttpRespondInput): void; // NB: Used for mocking/testing or providing alternative `fetch` implementations.
};

export type HttpAfterEvent = { type: 'HTTP/after'; payload: HttpAfter };
export type HttpAfter = {
  tx: string;
  method: t.HttpMethod;
  url: string;
  ok: boolean;
  status: number;
  response: t.HttpResponse;
  elapsed: IDuration;
};
