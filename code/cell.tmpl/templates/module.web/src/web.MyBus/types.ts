import * as t from '../common/types';

type InstanceId = string;
type Milliseconds = number;
type SemVer = string;

export type MyInfo = {
  module: { name: string; version: SemVer };
};

/**
 * EVENTS
 */

export type MyEvent = MyInfoReqEvent | MyInfoResEvent;

/**
 * Event API
 */
export type MyEvents = t.Disposable & {
  $: t.Observable<t.MyEvent>;
  id: InstanceId;
  is: { base(input: any): boolean };

  info: {
    req$: t.Observable<t.MyInfoReq>;
    res$: t.Observable<t.MyInfoRes>;
    get(options?: { timeout?: Milliseconds }): Promise<MyInfoRes>;
  };
};

/**
 * Module info.
 */
export type MyInfoReqEvent = {
  type: 'my.namespace/info:req';
  payload: MyInfoReq;
};
export type MyInfoReq = { tx: string; id: InstanceId };

export type MyInfoResEvent = {
  type: 'my.namespace/info:res';
  payload: MyInfoRes;
};
export type MyInfoRes = {
  tx: string;
  id: InstanceId;
  info?: MyInfo;
  error?: string;
};
