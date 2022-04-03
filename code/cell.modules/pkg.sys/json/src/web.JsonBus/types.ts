import * as t from '../common/types';

type J = t.Json;
type Id = string;
type Milliseconds = number;
type Semver = string;

export type JsonBusInstance = { bus: t.EventBus<any>; id: Id };
export type JsonEventFilter = (e: t.JsonEvent) => boolean;

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
  state: {
    req$: t.Observable<JsonStateReq>;
    res$: t.Observable<JsonStateRes>;
    get(options?: { timeout?: Milliseconds; key?: string }): Promise<JsonStateRes>;
  };
};

/**
 * EVENT (DEFINITIONS)
 */
export type JsonEvent = JsonInfoReqEvent | JsonInfoResEvent | JsonStateReqEvent | JsonStateResEvent;

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

/**
 * Retrieve the current state.
 */
export type JsonStateReqEvent = {
  type: 'sys.json/state:req';
  payload: JsonStateReq;
};
export type JsonStateReq = { instance: Id; tx: Id; key: string };

export type JsonStateResEvent<T extends J = J> = {
  type: 'sys.json/state:res';
  payload: JsonStateRes<T>;
};
export type JsonStateRes<T extends J = J> = {
  instance: Id;
  tx: Id;
  key: string;
  state?: T;
  error?: string;
};
