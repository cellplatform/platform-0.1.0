import * as t from '../web/common/types';

type Milliseconds = number;

export type SysFsInfo = {
  //
};

/**
 * Events
 */
export type SysFsEvent = SysFsInfoReqEvent | SysFsInfoResEvent;

export type SysFsEvents = t.Disposable & {
  $: t.Observable<t.SysFsEvent>;
  is: { base(input: any): boolean };

  info: {
    req$: t.Observable<t.SysFsInfoReq>;
    res$: t.Observable<t.SysFsInfoRes>;
    get(options?: { timeout?: Milliseconds }): Promise<SysFsInfoRes>;
  };
};

/**
 * Compile the project into a bundle.
 */
export type SysFsInfoReqEvent = {
  type: 'sys.fs/info:req';
  payload: t.SysFsInfoReq;
};
export type SysFsInfoReq = { tx?: string };

export type SysFsInfoResEvent = {
  type: 'sys.fs/info:res';
  payload: t.SysFsInfoRes;
};
export type SysFsInfoRes = { tx: string; info?: t.SysFsInfo; error?: string };
