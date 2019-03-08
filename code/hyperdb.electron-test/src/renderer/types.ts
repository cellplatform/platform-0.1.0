import { IDb, INetwork, IpcClient, DbIpcEvent, NetworkIpcEvent } from '../types';
export * from '../types';

/**
 * [Db]
 * Extensions to the API for a DB when it is running in the `renderer` process.
 */
export type IDbRenderer<D extends {} = any> = IDb<D> & {
  readonly checkoutVersion?: string;
  dispose(): void;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  authorize(peerKey: string): Promise<void>;
};

/**
 * [Network]
 * Extensions to the API for a network-swarm when it is running in the `renderer` process.
 */
export type INetworkRenderer = INetwork & {};

/**
 * [DB_Events]
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

/**
 * [Nework_Events]
 */
export type NetworkIpcRendererClient = IpcClient<NetworkIpcRendererEvent>;
export type NetworkIpcRendererEvent = NetworkIpcEvent;
