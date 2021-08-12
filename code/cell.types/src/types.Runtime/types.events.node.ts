import { t } from '../common';

type Id = string;
type Tx = string;
type Milliseconds = number;
type Timestamp = number;

export type RuntimeNodeProcessLifecycleStage = 'started' | 'completed' | 'killed';
export type RuntimeNodeInfo = {
  processes: { info: t.RuntimeNodeProcessInfo; startedAt: Timestamp }[];
};

export type RuntimeNodeProcessInfo = {
  tx: Tx;
  manifest?: RuntimeNodeProcessManifest;
};
export type RuntimeNodeProcessManifest = {
  hash: t.ModuleManifestHash;
  module: t.ModuleManifestInfo;
};

/**
 * Event API
 */
export type RuntimeNodeEvents = t.Disposable & {
  runtime: Id;
  $: t.Observable<t.RuntimeNodeEvent>;
  is: { base(input: any): boolean };

  /**
   * Retrieve status information about the runtime.
   */
  info: {
    req$: t.Observable<t.RuntimeNodeInfoReq>;
    res$: t.Observable<t.RuntimeNodeInfoRes>;
    get(options?: { timeout?: Milliseconds }): Promise<RuntimeNodeInfoRes>;
  };

  process: {
    /**
     * The stages of a processes life.
     */
    lifecycle: {
      $: t.Observable<t.RuntimeNodeProcessLifecycle>;
      fire(process: t.RuntimeNodeProcessInfo, stage: t.RuntimeNodeProcessLifecycleStage): void;
    };

    /**
     * Kills ("stops") a running process.
     */
    kill: {
      req$: t.Observable<t.RuntimeNodeKillReq>;
      res$: t.Observable<t.RuntimeNodeKillRes>;
      fire(process: Tx, options?: { timeout?: Milliseconds }): Promise<RuntimeNodeKillRes>;
    };
  };
};

/**
 * Events
 */
export type RuntimeNodeEvent =
  | RuntimeNodeInfoReqEvent
  | RuntimeNodeInfoResEvent
  | RuntimeNodeKillReqEvent
  | RuntimeNodeKillResEvent
  | RuntimeNodeProcessLifecycleEvent;

/**
 * Info
 */
export type RuntimeNodeInfoReqEvent = {
  type: 'cell.runtime.node/info:req';
  payload: RuntimeNodeInfoReq;
};
export type RuntimeNodeInfoReq = { tx?: Tx; runtime: Id };

export type RuntimeNodeInfoResEvent = {
  type: 'cell.runtime.node/info:res';
  payload: RuntimeNodeInfoRes;
};
export type RuntimeNodeInfoRes = { tx: Tx; runtime: Id; info?: RuntimeNodeInfo; error?: string };

/**
 * Kills ("stops") a running process.
 */
export type RuntimeNodeKillReqEvent = {
  type: 'cell.runtime.node/kill:req';
  payload: RuntimeNodeKillReq;
};
export type RuntimeNodeKillReq = { tx?: Tx; runtime: Id; process: Tx };

export type RuntimeNodeKillResEvent = {
  type: 'cell.runtime.node/kill:res';
  payload: RuntimeNodeKillRes;
};
export type RuntimeNodeKillRes = { tx: Tx; runtime: Id; error?: string };

/**
 * Process lifecycle
 */
export type RuntimeNodeProcessLifecycleEvent = {
  type: 'cell.runtime.node/lifecycle';
  payload: RuntimeNodeProcessLifecycle;
};
export type RuntimeNodeProcessLifecycle = {
  runtime: Id;
  process: t.RuntimeNodeProcessInfo;
  stage: t.RuntimeNodeProcessLifecycleStage;
};
