import * as t from '../common/types';

type InstanceId = string;
type Milliseconds = number;
type Semver = string;

export type WebRuntimeInfo = {
  version: Semver;
};

/**
 * EVENTS
 */

export type WebRuntimeEvent = WebRuntimeInfoReqEvent | WebRuntimeInfoResEvent;

/**
 * Event API
 */
export type WebRuntimeEvents = t.Disposable & {
  $: t.Observable<t.WebRuntimeEvent>;
  id: InstanceId;
  is: { base(input: any): boolean };

  info: {
    req$: t.Observable<t.WebRuntimeInfoReq>;
    res$: t.Observable<t.WebRuntimeInfoRes>;
    get(options?: { timeout?: Milliseconds }): Promise<WebRuntimeInfoRes>;
  };
};

/**
 * Module info.
 */
export type WebRuntimeInfoReqEvent = {
  type: 'sys.runtime.web/info:req';
  payload: WebRuntimeInfoReq;
};
export type WebRuntimeInfoReq = { tx: string; id: InstanceId };

export type WebRuntimeInfoResEvent = {
  type: 'sys.runtime.web/info:res';
  payload: WebRuntimeInfoRes;
};
export type WebRuntimeInfoRes = {
  tx: string;
  id: InstanceId;
  info?: WebRuntimeInfo;
  error?: string;
};
