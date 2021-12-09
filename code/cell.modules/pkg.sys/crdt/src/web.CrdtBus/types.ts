import * as t from '../common/types';

type InstanceId = string;
type Milliseconds = number;
type SemVer = string;

export type CrdtInfo = {
  module: { name: string; version: SemVer };
};

/**
 * EVENTS
 */

export type CrdtEvent = CrdtInfoReqEvent | CrdtInfoResEvent;

/**
 * Event API
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
};

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
export type CrdtInfoRes = {
  tx: string;
  id: InstanceId;
  info?: CrdtInfo;
  error?: string;
};
