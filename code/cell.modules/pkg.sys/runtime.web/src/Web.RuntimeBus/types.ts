import * as t from '../common/types';

type Id = string;
type TargetId = string;
type Milliseconds = number;
type SemVer = string;

export type WebRuntimeInstance = { bus: t.EventBus<any>; id?: Id };

export type WebRuntimeInfo = {
  module: { name: string; version: SemVer };
};

/**
 * Event API
 */
export type WebRuntimeEventsDisposable = WebRuntimeEvents &
  t.Disposable & { clone(): WebRuntimeEvents };

export type WebRuntimeEvents = {
  instance: { bus: Id; id: Id };
  $: t.Observable<t.WebRuntimeEvent>;
  dispose$: t.Observable<any>;

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
      module: t.ModuleManifestRemoteImport | null; // NB: <null> to clear.
    }): void;
  };

  netbus: {
    req$: t.Observable<t.WebRuntimeNetbusReq>;
    res$: t.Observable<t.WebRuntimeNetbusRes>;
    get(options?: { timeout?: Milliseconds }): Promise<WebRuntimeNetbusRes>;
  };
};

/**
 * EVENTS
 */

export type WebRuntimeEvent =
  | WebRuntimeInfoReqEvent
  | WebRuntimeInfoResEvent
  | WebRuntimeUseModuleEvent
  | WebRuntimeNetbusReqEvent
  | WebRuntimeNetbusResEvent;

/**
 * Module info.
 */
export type WebRuntimeInfoReqEvent = {
  type: 'sys.runtime.web/info:req';
  payload: WebRuntimeInfoReq;
};
export type WebRuntimeInfoReq = { tx: string; instance: Id };

export type WebRuntimeInfoResEvent = {
  type: 'sys.runtime.web/info:res';
  payload: WebRuntimeInfoRes;
};
export type WebRuntimeInfoRes = {
  tx: string;
  instance: Id;
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
  instance: Id;
  target: TargetId;
  module: t.ModuleManifestRemoteImport | null;
};

/**
 * Netbus retrieval event
 */
export type WebRuntimeNetbusReqEvent = {
  type: 'sys.runtime.web/netbus:req';
  payload: WebRuntimeNetbusReq;
};
export type WebRuntimeNetbusReq = { tx: string; instance: Id };

export type WebRuntimeNetbusResEvent = {
  type: 'sys.runtime.web/netbus:res';
  payload: WebRuntimeNetbusRes;
};
export type WebRuntimeNetbusRes = {
  tx: string;
  instance: Id;
  exists: boolean;
  netbus?: t.NetworkBus;
  error?: string;
};
