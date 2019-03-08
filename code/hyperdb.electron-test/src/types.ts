export * from './renderer/types';
export * from '@platform/hyperdb/lib/types';

/**
 * [Common]
 */
import { IDbProps, IDbMethods, DbEvent, INetworkProps } from '@platform/hyperdb/lib/types';
import { IpcClient, ILog } from '@platform/electron/lib/types';
export { IpcClient, ILog };

/**
 * [Db] Events
 */
export type DbIpcClient = IpcClient<DbIpcEvent>;
export type DbIpcEvent = IDbGetStateEvent | IDbUpdateStateEvent | IDbInvokeEvent | DbEvent;

export type IDbGetStateEvent = {
  type: 'DB/state/get';
  payload: {
    db: { dir: string; dbKey?: string; version?: string };
    fields?: Array<keyof IDbProps>;
  };
};
export type IDbUpdateStateEvent = {
  type: 'DB/state/update';
  payload: {
    db: { dir: string };
    props: IDbProps;
  };
};
export type IDbInvokeEvent = {
  type: 'DB/invoke';
  payload: {
    db: { dir: string; dbKey?: string; version?: string };
    method: keyof IDbMethods;
    params: any[];
  };
};
export type IDbInvokeResponse<M extends keyof IDbMethods = any> = {
  method: M;
  result?: IDbMethods[M];
  error?: { message: string };
};

/**
 * [Network] Events
 */
export type NetworkIpcClient = IpcClient<NetworkIpcEvent>;
export type NetworkIpcEvent = INetworkUpdateStateEvent | INetworkGetStateEvent;

export type INetworkGetStateEvent = {
  type: 'NETWORK/state/get';
  payload: {
    db: { dir: string };
    fields?: Array<keyof INetworkProps>;
  };
};

export type INetworkUpdateStateEvent = {
  type: 'NETWORK/state/update';
  payload: {
    db: { dir: string };
    props: INetworkProps;
  };
};
