export * from './renderer/types';
export * from '@platform/hyperdb/lib/types';

/**
 * [Common]
 */
import { IDbProps, IDbMethods, DbEvent } from '@platform/hyperdb/lib/types';
import { IpcClient, ILog } from '@platform/electron/lib/types';
export { IpcClient, ILog };

/**
 * [Network]
 */

type Bitfield = any;
type TreeIndex = { [key: string]: Bitfield };

/**
 * Local writable feed.
 * You have to get an owner of the hyperdb to authorize you to have your writes replicate.
 * The first person to create the hyperdb is the first owner.
 */
export type IFeed = {
  id: Buffer;
  key: Buffer;
  bitfield: Bitfield;
  discoveryKey: Buffer;
  secretKey: Buffer;
  peers: IPeer[];
  tree: TreeIndex;
  length: number;
  maxRequests: number;
  byteLength: number;
  remoteLength: number;
  allowPush: boolean;
  live: boolean;
  opened: boolean;
  readable: boolean;
  sparse: boolean;
  writable: boolean;
  closed: false;
};

export type IPeer = {
  channel: Buffer;
  host: string;
  id: Buffer;
  initiator: boolean;
  port: number;
  type: 'tcp';
};

export type IProtocol = {
  id: Buffer;
  key: Buffer;
  ack: boolean;
  allowHalfOpen: boolean;
  discoveryKey: Buffer;
  expectedFeeds: number;
  feeds: IFeed[];
  userData: any;
  maxFeeds: number;
  live: boolean;
  readable: boolean;
  writable: boolean;
  encrypted: boolean;
  extension: any[];
  destroyed: boolean;

  remoteId: Buffer;
  remoteAck: boolean;
  remoteDiscoveryKey: Buffer;
  removeLive: boolean;
  remoteUserData: any;
  remoteExtensions: any[];
};

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
