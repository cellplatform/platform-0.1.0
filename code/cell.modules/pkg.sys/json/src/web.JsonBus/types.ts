import * as t from '../common/types';

type Id = string;
type Milliseconds = number;
type Semver = string;

export type JsonBusInstance = { bus: t.EventBus<any>; id: Id };

export type JsonInfo = {
  module: { name: string; version: Semver };
};

/**
 * EVENT (API)
 */
export type JsonEvents = t.Disposable & {
  $: t.Observable<t.JsonEvent>;
  instance: { bus: Id; id: Id };
  is: { base(input: any): boolean };
  info: {
    req$: t.Observable<t.JsonInfoReq>;
    res$: t.Observable<t.JsonInfoRes>;
    get(options?: { timeout?: Milliseconds }): Promise<JsonInfoRes>;
  };
};

/**
 * EVENT (DEFINITIONS)
 */
export type JsonEvent = JsonInfoReqEvent | JsonInfoResEvent;

/**
 * Module info.
 */
export type JsonInfoReqEvent = {
  type: 'sys.json/info:req';
  payload: JsonInfoReq;
};
export type JsonInfoReq = { tx: string; instance: Id };

export type JsonInfoResEvent = {
  type: 'sys.json/info:res';
  payload: JsonInfoRes;
};
export type JsonInfoRes = {
  tx: string;
  instance: Id;
  info?: JsonInfo;
  error?: string;
};
