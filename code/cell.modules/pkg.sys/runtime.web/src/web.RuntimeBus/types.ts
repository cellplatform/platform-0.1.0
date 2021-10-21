import * as t from '../common/types';

type InstanceId = string;
type TargetId = string;
type Milliseconds = number;
type SemVer = string;

export type WebRuntimeInfo = {
  module: { name: string; version: SemVer };
};

/**
 * EVENTS
 */

export type WebRuntimeEvent =
  | WebRuntimeInfoReqEvent
  | WebRuntimeInfoResEvent
  | WebRuntimeUseModuleEvent;

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

  useModule: {
    $: t.Observable<t.WebRuntimeUseModule>;
    fire(args: {
      target: string;
      remote: t.ModuleManifestRemoteImport | null; // NB: null to clear.
    }): void;
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
  exists: boolean;
  info?: WebRuntimeInfo;
  error?: string;
};

/**
 * Use a remote Module
 */
export type WebRuntimeUseModuleEvent = {
  type: 'sys.runtime.web/useModule';
  payload: WebRuntimeUseModule;
};
export type WebRuntimeUseModule = {
  id: InstanceId;
  target: TargetId;
  remote: t.ModuleManifestRemoteImport | null;
};
