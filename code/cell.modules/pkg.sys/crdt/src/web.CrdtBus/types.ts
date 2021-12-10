import * as t from '../common/types';

type O = Record<string, unknown>;
type DocumentId = string;
type InstanceId = string;
type Milliseconds = number;
type SemVer = string;

export type CrdtInfo = {
  module: { name: string; version: SemVer };
  dataformat: { name: string; version: SemVer };
};

export type CrdtChangeHandler<T extends O> = (doc: T) => void;

/**
 * Event API.
 */
export type CrdtEvents = t.Disposable & {
  $: t.Observable<t.CrdtEvent>;
  id: InstanceId;
  is: { base(input: any): boolean };

  info: {
    req$: t.Observable<t.CrdtInfoReq>;
    res$: t.Observable<t.CrdtInfoRes>;
    get(options?: { timeout?: Milliseconds }): Promise<CrdtInfoRes>;
  };

  state: {
    req$: t.Observable<t.CrdtRefReq>;
    res$: t.Observable<t.CrdtRefRes>;
    changed$: t.Observable<t.CrdtRefChanged>;
    fire<T extends O>(args: {
      doc: DocumentId;
      initial: T | (() => T);
      change?: CrdtChangeHandler<T>;
      timeout?: Milliseconds;
    }): Promise<CrdtRefRes<T>>;
    exists: {
      req$: t.Observable<t.CrdtRefExistsReq>;
      res$: t.Observable<t.CrdtRefExistsRes>;
      fire(doc: DocumentId, options?: { timeout?: Milliseconds }): Promise<CrdtRefExistsRes>;
    };
    remove: {
      $: t.Observable<t.CrdtRefRemove>;
      fire(doc: DocumentId): Promise<void>;
    };
  };

  doc<T extends O>(args: CrdtDocEventsArgs<T>): CrdtDocEvents<T>;
};

export type CrdtDocEventsArgs<T> = { id: DocumentId; initial: T | (() => T) };

/**
 * Event API: Single document.
 */
export type CrdtDocEvents<T extends O> = {
  id: DocumentId;
  // object: T;
};

/**
 * EVENTS
 */

export type CrdtEvent =
  | CrdtInfoReqEvent
  | CrdtInfoResEvent
  | CrdtRefReqEvent
  | CrdtRefResEvent
  | CrdtRefRemoveEvent
  | CrdtRefExistsReqEvent
  | CrdtRefExistsResEvent
  | CrdtRefChangedEvent;

/**
 * Module info.
 */
export type CrdtInfoReqEvent = {
  type: 'sys.crdt/info:req';
  payload: CrdtInfoReq;
};
export type CrdtInfoReq = { tx: string; id: InstanceId };

export type CrdtInfoResEvent = {
  type: 'sys.crdt/info:res';
  payload: CrdtInfoRes;
};
export type CrdtInfoRes = { tx: string; id: InstanceId; info?: CrdtInfo; error?: string };

/**
 * Refs
 */
export type CrdtRefReqEvent<T extends O = O> = {
  type: 'sys.crdt/ref:req';
  payload: CrdtRefReq<T>;
};
export type CrdtRefReq<T extends O = O> = {
  tx: string;
  id: InstanceId;
  doc: DocumentId;
  initial: T | (() => T);
  change?: CrdtChangeHandler<T>;
};

export type CrdtRefResEvent<T extends O = O> = {
  type: 'sys.crdt/ref:res';
  payload: CrdtRefRes<T>;
};
export type CrdtRefRes<T extends O = O> = {
  tx: string;
  id: InstanceId;
  created: boolean;
  changed: boolean;
  doc: { id: DocumentId; data: T };
  error?: string;
};

/**
 * Refs: remove
 */
export type CrdtRefRemoveEvent = {
  type: 'sys.crdt/ref/remove';
  payload: CrdtRefRemove;
};
export type CrdtRefRemove = {
  id: InstanceId;
  doc: DocumentId;
};

/**
 * Refs: exists
 */
export type CrdtRefExistsReqEvent = {
  type: 'sys.crdt/ref/exists:req';
  payload: CrdtRefExistsReq;
};
export type CrdtRefExistsReq = { tx: string; id: InstanceId; doc: DocumentId };

export type CrdtRefExistsResEvent = {
  type: 'sys.crdt/ref/exists:res';
  payload: CrdtRefExistsRes;
};
export type CrdtRefExistsRes = {
  tx: string;
  id: InstanceId;
  doc: DocumentId;
  exists: boolean;
  error?: string;
};

/**
 * Ref: document changed.
 */
export type CrdtRefChangedEvent<T extends O = O> = {
  type: 'sys.crdt/changed';
  payload: CrdtRefChanged<T>;
};
export type CrdtRefChanged<T extends O = O> = {
  tx: string;
  id: InstanceId;
  doc: { id: DocumentId; prev: T; next: T };
};
