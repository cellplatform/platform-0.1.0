import * as t from '../web/common/types';

type InstanceId = string;
type Milliseconds = number;

export type VimeoInfo = {
  api: { version: '3.4' };
};

/**
 * EVENTS
 */

export type VimeoEvent = VimeoInfoReqEvent | VimeoInfoResEvent;

/**
 * Event API
 */
export type VimeoEvents = t.Disposable & {
  $: t.Observable<t.VimeoEvent>;
  id: InstanceId;
  is: { base(input: any): boolean };

  info: {
    req$: t.Observable<t.VimeoInfoReq>;
    res$: t.Observable<t.VimeoInfoRes>;
    get(options?: { timeout?: Milliseconds }): Promise<VimeoInfoRes>;
  };
};

/**
 * Module info.
 */
export type VimeoInfoReqEvent = {
  type: 'vendor.vimeo/info:req';
  payload: VimeoInfoReq;
};
export type VimeoInfoReq = { tx: string; id: InstanceId; me?: boolean };

export type VimeoInfoResEvent = {
  type: 'vendor.vimeo/info:res';
  payload: VimeoInfoRes;
};
export type VimeoInfoRes = {
  tx: string;
  id: InstanceId;
  info?: VimeoInfo;
  me?: t.VimeoUser;
  error?: string;
};
