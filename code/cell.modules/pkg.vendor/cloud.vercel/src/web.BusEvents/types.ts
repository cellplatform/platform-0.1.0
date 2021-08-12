import * as t from '../web/common/types';

type Milliseconds = number;

export type VercelInfo = {
  /**
   * https://vercel.com/docs/api#endpoints
   */
  endpoint: {
    version: number; // Base version of the HTTP endpoint.
  };
};

/**
 * Events
 */
export type VercelEvent = VercelInfoReqEvent | VercelInfoResEvent;

export type VercelEvents = t.Disposable & {
  $: t.Observable<t.VercelEvent>;
  is: { base(input: any): boolean };

  info: {
    req$: t.Observable<t.VercelInfoReq>;
    res$: t.Observable<t.VercelInfoRes>;
    get(options?: { timeout?: Milliseconds }): Promise<VercelInfoRes>;
  };
};

/**
 * Compile the project into a bundle.
 */
export type VercelInfoReqEvent = {
  type: 'vendor.vercel/info:req';
  payload: VercelInfoReq;
};
export type VercelInfoReq = { tx?: string };

export type VercelInfoResEvent = {
  type: 'vendor.vercel/info:res';
  payload: VercelInfoRes;
};
export type VercelInfoRes = { tx: string; info?: VercelInfo; error?: string };
