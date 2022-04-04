import * as t from '../common/types';

type J = t.JsonMap;
type Id = string;
type Milliseconds = number;
type Semver = string;

export type JsonBusInstance = { bus: t.EventBus<any>; id: Id };
export type JsonEventFilter = (e: t.JsonEvent) => boolean;
export type JsonStateChange = { key: string; op: JsonStateChangeOperation; value: t.Json };
export type JsonStateChangeOperation = 'update' | 'replace';
export type JsonStateMutator<T extends J = J> = (prev: T) => any | Promise<any>;

export type JsonInfo = {
  module: { name: string; version: Semver };
  keys: string[];
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
    get: {
      req$: t.Observable<JsonStateReq>;
      res$: t.Observable<JsonStateRes>;
      fire(options?: JsonEventsGetOptions): Promise<JsonStateRes>;
    };
    put: {
      req$: t.Observable<JsonStatePutReq>;
      res$: t.Observable<JsonStatePutRes>;
      fire<T extends J = J>(value: T, options?: JsonEventsPutOptions): Promise<JsonStateRes>;
    };
    patch: {
      req$: t.Observable<JsonStatePatchReq>;
      res$: t.Observable<JsonStatePatchRes>;
      fire<T extends J = J>(
        handler: JsonStateMutator<T>,
        options?: JsonEventsPatchOptions<T>,
      ): Promise<JsonStatePatchRes>;
    };
  };

  get(options?: JsonEventsGetOptions): Promise<JsonStateRes>;
  put<T extends J = J>(value: T, options?: JsonEventsPutOptions): Promise<JsonStateRes>;
  patch<T extends J = J>(
    handler: JsonStateMutator<T>,
    options?: JsonEventsPatchOptions<T>,
  ): Promise<JsonStatePatchRes>;
};

export type JsonEventsGetOptions = { timeout?: Milliseconds; key?: string };
export type JsonEventsPutOptions = { timeout?: Milliseconds; key?: string };
export type JsonEventsPatchOptions<T extends J> = {
  timeout?: Milliseconds;
  key?: string;
  initial?: T;
};

/**
 * EVENT (DEFINITIONS)
 */
export type JsonEvent =
  | JsonInfoReqEvent
  | JsonInfoResEvent
  | JsonStateReqEvent
  | JsonStateResEvent
  | JsonStatePutReqEvent
  | JsonStatePutResEvent
  | JsonStatePatchReqEvent
  | JsonStatePatchResEvent;

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
  value?: T;
  error?: string;
};

/**
 * PUT: update/overwrite the current state.
 */
export type JsonStatePutReqEvent<T extends J = J> = {
  type: 'sys.json/state.put:req';
  payload: JsonStatePutReq<T>;
};
export type JsonStatePutReq<T extends J = J> = { instance: Id; tx: Id; key: string; value: T };

export type JsonStatePutResEvent = {
  type: 'sys.json/state.put:res';
  payload: JsonStatePutRes;
};
export type JsonStatePutRes = { instance: Id; tx: Id; key: string; error?: string };

/**
 * PATCH: update/overwrite the current state.
 */
export type JsonStatePatchReqEvent = {
  type: 'sys.json/state.patch:req';
  payload: JsonStatePatchReq;
};
export type JsonStatePatchReq = {
  instance: Id;
  tx: Id;
  key: string;
  op: JsonStateChangeOperation;
  patches: t.PatchSet;
};

export type JsonStatePatchResEvent = {
  type: 'sys.json/state.patch:res';
  payload: JsonStatePatchRes;
};
export type JsonStatePatchRes = {
  instance: Id;
  tx: Id;
  key: string;
  error?: string;
};
