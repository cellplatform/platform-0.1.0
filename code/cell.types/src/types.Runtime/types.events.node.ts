import { t } from '../common';

type Id = string;
type Tx = string;
type Milliseconds = number;
type Timestamp = number;
type RuntimeInstanceId = string;

export type RuntimeNodeInfo = {
  processes: RuntimeNodeInfoProcess[];
};
export type RuntimeNodeInfoProcess = { info: t.RuntimeNodeProcessInfo; startedAt: Timestamp };

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
  is: {
    base(input: any): boolean;
    lifecycle(stage: t.RuntimeRunStage): { ok: boolean; ended: boolean };
  };

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
      fire(process: t.RuntimeNodeProcessInfo, stage: t.RuntimeRunStage): void;
    };

    /**
     * Kills ("stops") a running process.
     */
    kill: {
      req$: t.Observable<t.RuntimeNodeKillReq>;
      res$: t.Observable<t.RuntimeNodeKillRes>;
      killed$: t.Observable<t.RuntimeNodeKilled>;
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
  | RuntimeNodeProcessLifecycleEvent
  | RuntimeNodeKillReqEvent
  | RuntimeNodeKillResEvent
  | RuntimeNodeKilledEvent;

/**
 * Info
 */
export type RuntimeNodeInfoReqEvent = {
  type: 'cell.runtime.node/info:req';
  payload: RuntimeNodeInfoReq;
};
export type RuntimeNodeInfoReq = { tx?: Tx; runtime: RuntimeInstanceId };

export type RuntimeNodeInfoResEvent = {
  type: 'cell.runtime.node/info:res';
  payload: RuntimeNodeInfoRes;
};
export type RuntimeNodeInfoRes = {
  tx: Tx;
  runtime: RuntimeInstanceId;
  info?: RuntimeNodeInfo;
  error?: string;
};

/**
 * Process lifecycle
 */
export type RuntimeNodeProcessLifecycleEvent = {
  type: 'cell.runtime.node/lifecycle';
  payload: RuntimeNodeProcessLifecycle;
};
export type RuntimeNodeProcessLifecycle = {
  runtime: RuntimeInstanceId;
  process: t.RuntimeNodeProcessInfo;
  stage: t.RuntimeRunStage;
};

/**
 * Kills ("stops") a running process.
 */
export type RuntimeNodeKillReqEvent = {
  type: 'cell.runtime.node/kill:req';
  payload: RuntimeNodeKillReq;
};
export type RuntimeNodeKillReq = { tx: Tx; runtime: RuntimeInstanceId; process: Tx };

export type RuntimeNodeKillResEvent = {
  type: 'cell.runtime.node/kill:res';
  payload: RuntimeNodeKillRes;
};
export type RuntimeNodeKillRes = {
  tx: Tx;
  runtime: RuntimeInstanceId;
  process?: t.RuntimeNodeProcessInfo;
  elapsed: Milliseconds;
  error?: string;
};

export type RuntimeNodeKilledEvent = {
  type: 'cell.runtime.node/killed';
  payload: RuntimeNodeKilled;
};
export type RuntimeNodeKilled = {
  tx: Tx;
  runtime: RuntimeInstanceId;
  process: t.RuntimeNodeProcessInfo;
  elapsed: Milliseconds;
};
