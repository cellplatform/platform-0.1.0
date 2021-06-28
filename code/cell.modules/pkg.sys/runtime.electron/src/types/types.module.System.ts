import { t } from './common';

type Uri = string;

export type SystemStatus = {
  service: SystemStatusService;
  is: { prod: boolean; dev: boolean; mac: boolean };
  runtime: t.ElectronRuntimeInfo;
  genesis: Uri;
};

export type SystemStatusService = {
  protocol: t.HttpProtocol;
  host: string;
  port: number;
  url: string;
};

/**
 * Events
 */
export type SystemEvent =
  | SystemStatusReqEvent
  | SystemStatusResEvent
  | SystemOpenPathEvent
  | SystemDataSnapshotEvent
  | SystemDataResetEvent;

/**
 * Retrieve the main system status.
 */
export type SystemStatusReqEvent = {
  type: 'runtime.electron/System/status:req';
  payload: SystemStatusReq;
};
export type SystemStatusReq = { tx?: string };

export type SystemStatusResEvent = {
  type: 'runtime.electron/System/status:res';
  payload: SystemStatusRes;
};
export type SystemStatusRes = { tx: string; status: SystemStatus };

/**
 * Reveal folder.
 */
export type SystemOpenPathEvent = {
  type: 'runtime.electron/System/open/path';
  payload: SystemOpenPath;
};
export type SystemOpenPath = { path: string };

/**
 * Snapshot ("backup") data.
 */
export type SystemDataSnapshotEvent = {
  type: 'runtime.electron/System/data/snapshot';
  payload: SystemDataSnapshot;
};
export type SystemDataSnapshot = { openDir?: boolean };

/**
 * Snapshot ("backup") data.
 */
export type SystemDataResetEvent = {
  type: 'runtime.electron/System/data/reset';
  payload: SystemDataReset;
};
export type SystemDataReset = { openDir?: boolean; reopen?: boolean; quit?: boolean };
