import * as t from '../common/types';

type J = Record<string, unknown>;
type Id = string;
type Milliseconds = number;
type KeyPath = string;
type Semver = string;

export type JsonBusInstance = { bus: t.EventBus<any>; id: Id };
export type JsonEventFilter = (e: t.JsonEvent) => boolean;
export type JsonStateChange<T extends J = J> = {
  key: KeyPath;
  op: t.PatchOperationKind;
  value: T;
};
export type JsonStateMutator<T extends J = J> = (prev: T) => any | Promise<any>;

export type JsonInfo = {
  module: { name: string; version: Semver };
  keys: string[];
};

/**
 * EVENT (API)
 */
export type JsonEvents = t.Disposable & {
  instance: { bus: Id; id: Id };
  $: t.Observable<t.JsonEvent>;
  changed$: t.Observable<t.JsonStateChange>;
  is: { base(input: any): boolean };
  info: JsonEventsInfo;
  state: JsonEventsState;
  json<T extends J = J>(options?: JsonStateOptions<T>): JsonState<T>;
};

export type JsonEventsInfo = {
  req$: t.Observable<t.JsonInfoReq>;
  res$: t.Observable<t.JsonInfoRes>;
  get(options?: { timeout?: Milliseconds }): Promise<JsonInfoRes>;
};

/**
 * State API.
 */
export type JsonEventsState = {
  get: {
    req$: t.Observable<JsonStateGetReq>;
    res$: t.Observable<JsonStateGetRes>;
    fire<T extends J = J>(options?: {
      tx?: Id;
      timeout?: Milliseconds;
      key?: KeyPath;
      initial?: T | (() => T);
    }): Promise<JsonStateGetRes<T>>;
  };
  put: {
    req$: t.Observable<JsonStatePutReq>;
    res$: t.Observable<JsonStatePutRes>;
    fire<T extends J = J>(
      value: T,
      options?: { tx?: Id; timeout?: Milliseconds; key?: KeyPath },
    ): Promise<JsonStatePutRes>;
  };
  patch: {
    req$: t.Observable<JsonStatePatchReq>;
    res$: t.Observable<JsonStatePatchRes>;
    fire<T extends J = J>(
      fn: JsonStateMutator<T>,
      options?: { tx?: Id; timeout?: Milliseconds; key?: KeyPath; initial?: T | (() => T) },
    ): Promise<JsonStatePatchRes>;
  };
};

/**
 * JSON (key-pathed convenience method).
 */
export type JsonStateOptions<T extends J> = {
  key?: KeyPath;
  timeout?: Milliseconds;
  initial?: T | (() => T);
};
export type JsonState<T extends J = J> = {
  $: t.Observable<t.JsonStateChange<T>>;
  get(options?: { timeout?: Milliseconds }): Promise<JsonStateGetRes<T>>;
  put(value: T, options?: { timeout?: Milliseconds }): Promise<JsonStatePutRes>;
  patch(fn: JsonStateMutator<T>, options?: { timeout?: Milliseconds }): Promise<JsonStatePatchRes>;
};

/**
 * EVENT (DEFINITIONS)
 */
export type JsonEvent =
  | JsonInfoReqEvent
  | JsonInfoResEvent
  | JsonStateGetReqEvent
  | JsonStateGetResEvent
  | JsonStatePutReqEvent
  | JsonStatePutResEvent
  | JsonStatePatchReqEvent
  | JsonStatePatchResEvent
  | JsonStateChangedEvent;

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
export type JsonStateGetReqEvent = {
  type: 'sys.json/state.get:req';
  payload: JsonStateGetReq;
};
export type JsonStateGetReq = { instance: Id; tx: Id; key: string };

export type JsonStateGetResEvent<T extends J = J> = {
  type: 'sys.json/state.get:res';
  payload: JsonStateGetRes<T>;
};
export type JsonStateGetRes<T extends J = J> = {
  instance: Id;
  tx: Id;
  key: KeyPath;
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
export type JsonStatePutReq<T extends J = J> = { instance: Id; tx: Id; key: KeyPath; value: T };

export type JsonStatePutResEvent = {
  type: 'sys.json/state.put:res';
  payload: JsonStatePutRes;
};
export type JsonStatePutRes = { instance: Id; tx: Id; key: KeyPath; error?: string };

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
  key: KeyPath;
  op: t.PatchOperationKind;
  patches: t.PatchSet;
};

export type JsonStatePatchResEvent = {
  type: 'sys.json/state.patch:res';
  payload: JsonStatePatchRes;
};
export type JsonStatePatchRes = {
  instance: Id;
  tx: Id;
  key: KeyPath;
  error?: string;
};

/**
 * Fired when the state changes.
 */
export type JsonStateChangedEvent = {
  type: 'sys.json/state:changed';
  payload: JsonStateChanged;
};
export type JsonStateChanged = {
  instance: Id;
  change: JsonStateChange;
};
