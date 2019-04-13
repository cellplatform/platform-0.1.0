export * from './renderer/types';
export * from '@platform/hyperdb.types';
export * from '@platform/hyperdb/lib/types';

/**
 * [Common]
 */
import {
  IDbProps,
  IDbMethods,
  DbEvent,
  INetworkProps,
  INetworkMethods,
  NetworkEvent,
} from '@platform/hyperdb/lib/types';
import { IpcClient, ILog } from '@platform/electron/lib/types';
export { IpcClient, ILog };

export type HyperdbIpcEvent = DbIpcEvent | NetworkIpcEvent;
export type HyperdbIpc = IpcClient<HyperdbIpcEvent>;

/**
 * [Db] Events
 */
export type DbIpcEvent = DbEvent | IDbGetStateEvent | IDbUpdateStateEvent | IDbInvokeEvent;

export type IDbGetStateEvent = {
  type: 'DB/ipc/state/get';
  payload: {
    db: { dir: string; version?: string; dbKey?: string };
    fields?: Array<keyof IDbProps>;
  };
};
export type IDbUpdateStateEvent = {
  type: 'DB/ipc/state/update';
  payload: {
    db: { dir: string; version?: string };
    props: IDbProps;
  };
};
export type IDbInvokeEvent = {
  type: 'DB/ipc/invoke';
  payload: {
    db: { dir: string; dbKey?: string; version?: string };
    method: keyof IDbMethods;
    params: any[];
    wait?: boolean;
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
export type NetworkIpcEvent =
  | NetworkEvent
  | INetworkUpdateStateEvent
  | INetworkGetStateEvent
  | INetworkInvokeEvent;

export type INetworkGetStateEvent = {
  type: 'NETWORK/ipc/state/get';
  payload: {
    db: { dir: string; version?: string };
    fields?: Array<keyof INetworkProps>;
  };
};
export type INetworkUpdateStateEvent = {
  type: 'NETWORK/ipc/state/update';
  payload: {
    db: { dir: string; version?: string };
    props: INetworkProps;
  };
};
export type INetworkInvokeEvent = {
  type: 'NETWORK/ipc/invoke';
  payload: {
    db: { dir: string; version?: string };
    method: keyof INetworkMethods;
    params: any[];
    wait?: boolean;
  };
};
export type INetworkInvokeResponse<M extends keyof INetworkMethods = any> = {
  method: M;
  result?: INetworkMethods[M];
  error?: { message: string };
};
