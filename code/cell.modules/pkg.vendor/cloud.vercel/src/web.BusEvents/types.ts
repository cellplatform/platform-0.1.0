import * as t from '../web/common/types';

type Instance = string;
type Milliseconds = number;
type IdOrName = string;
type Name = string;

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

export type VercelEvent =
  | VercelInfoReqEvent
  | VercelInfoResEvent
  | VercelDeployReqEvent
  | VercelDeployResEvent;

export type VercelEvents = t.Disposable & {
  $: t.Observable<t.VercelEvent>;
  id: Instance;
  is: { base(input: any): boolean };

  info: {
    req$: t.Observable<t.VercelInfoReq>;
    res$: t.Observable<t.VercelInfoRes>;
    get(options?: { timeout?: Milliseconds }): Promise<VercelInfoRes>;
  };

  deploy: {
    req$: t.Observable<t.VercelDeployReq>;
    res$: t.Observable<t.VercelDeployRes>;
    fire(args: {
      source: t.VercelSourceBundle;
      team: IdOrName;
      project: Name;
      timeout?: Milliseconds;

      /**
       * Vercel configuration options.
       * https://vercel.com/docs/rest-api#endpoints/deployments/create-a-new-deployment
       */
      name?: t.VercelHttpDeployConfig['name'];
      env?: t.VercelHttpDeployConfig['env'];
      buildEnv?: t.VercelHttpDeployConfig['buildEnv'];
      functions?: t.VercelHttpDeployConfig['functions'];
      regions?: t.VercelHttpDeployConfig['regions'];
      routes?: t.VercelHttpDeployConfig['routes'];
      public?: t.VercelHttpDeployConfig['public'];
      target?: t.VercelHttpDeployConfig['target'];
      alias?: t.VercelHttpDeployConfig['alias'];
    }): Promise<VercelDeployRes>;
  };
};

/**
 * Module info.
 */
export type VercelInfoReqEvent = {
  type: 'vendor.vercel/info:req';
  payload: VercelInfoReq;
};
export type VercelInfoReq = { tx: string; id: Instance };

export type VercelInfoResEvent = {
  type: 'vendor.vercel/info:res';
  payload: VercelInfoRes;
};
export type VercelInfoRes = { tx: string; id: Instance; info?: VercelInfo; error?: string };

/**
 * Deploy
 */
export type VercelDeployReqEvent = {
  type: 'vendor.vercel/deploy:req';
  payload: VercelDeployReq;
};
export type VercelDeployReq = {
  tx: string;
  id: Instance;
  team: IdOrName;
  project: Name;
  source: t.VercelSourceBundle;
  config?: t.VercelHttpDeployConfig;
};

export type VercelDeployResEvent = {
  type: 'vendor.vercel/deploy:res';
  payload: VercelDeployRes;
};
export type VercelDeployRes = {
  tx: string;
  id: Instance;
  paths: string[];
  deployment?: t.VercelHttpDeployResponse['deployment'];
  error?: string;
};
