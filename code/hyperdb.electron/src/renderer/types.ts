import { IDb, IpcClient, DbIpcEvent } from '../helpers/db/types';

export * from '../types';

/**
 * [RendererDb]
 * Extensions to the API for a DB when it is running in the `renderer` process.
 */
export type IRendererDb<D extends {} = any> = IDb<D> & {
  readonly checkoutVersion?: string;
  dispose(): void;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
};

/**
 * [IPC] Events
 */
export type DbIpcRendererClient = IpcClient<DbIpcRendererEvent>;
export type DbIpcRendererEvent = DbIpcEvent | IDbConnectEvent | IDbDisconnectEvent;

export type IDbConnectEvent = {
  type: 'DB/connect';
  payload: { db: { dir: string; dbKey?: string; version?: string } };
};

export type IDbDisconnectEvent = {
  type: 'DB/disconnect';
  payload: { db: { dir: string; dbKey?: string; version?: string } };
};
