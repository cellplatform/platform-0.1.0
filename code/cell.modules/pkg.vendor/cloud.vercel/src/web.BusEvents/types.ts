import * as t from '../web/common/types';

type Milliseconds = number;

export type VercelModuleInfo = {
  version: number; // Base version of the API endpoint being used.
};

/**
 * Events
 */
export type VercelEvent = VercelModuleInfoReqEvent | VercelModuleInfoResEvent;

export type VercelEvents = t.Disposable & {
  $: t.Observable<t.VercelEvent>;
  is: { base(input: any): boolean };

  moduleInfo: {
    req$: t.Observable<t.VercelModuleInfoReq>;
    res$: t.Observable<t.VercelModuleInfoRes>;
    get(options?: { timeout?: Milliseconds }): Promise<VercelModuleInfoRes>;
  };
};

/**
 * Compile the project into a bundle.
 */
export type VercelModuleInfoReqEvent = {
  type: 'vendor.vercel/info:req';
  payload: VercelModuleInfoReq;
};
export type VercelModuleInfoReq = { tx?: string };

export type VercelModuleInfoResEvent = {
  type: 'vendor.vercel/info:res';
  payload: VercelModuleInfoRes;
};
export type VercelModuleInfoRes = { tx: string; info?: VercelModuleInfo; error?: string };
