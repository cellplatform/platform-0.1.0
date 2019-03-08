export * from './renderer/types';
export * from '@platform/hyperdb/lib/types';

/**
 * [Common]
 */
import { IDbProps, IDbMethods, DbEvent } from '@platform/hyperdb/lib/types';
import { IpcClient, ILog } from '@platform/electron/lib/types';
export { IpcClient, ILog };

/**
 * [IPC] Events
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
