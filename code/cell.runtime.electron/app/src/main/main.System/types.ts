import * as t from '../common/types';

export type SystemStatus = {
  service: SystemStatusService;
  is: { prod: boolean; dev: boolean; mac: boolean };
  runtime: t.ElectronRuntimeInfo;
  refs: t.IConfigFile['refs'];
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
export type SystemEvent = SystemStatusReqEvent | SystemStatusResEvent;

/**
 * Retrieve the main system status.
 */
export type SystemStatusReqEvent = {
  type: 'runtime.electron/sys/status:req';
  payload: SystemStatusReq;
};
export type SystemStatusReq = {
  tx?: string;
};

export type SystemStatusResEvent = {
  type: 'runtime.electron/sys/status:res';
  payload: SystemStatusRes;
};
export type SystemStatusRes = {
  tx: string;
  status: SystemStatus;
};
