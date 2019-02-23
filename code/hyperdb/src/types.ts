export * from './helpers/db/types';
export * from './helpers/swarm/types';

/**
 * [Common]
 */
import { IpcClient, ILog } from '@platform/electron/lib/types';
export { IpcClient, ILog };

/**
 * [RendererDb]
 * Extensions to the API for a DB when it is running in the `renderer` process.
 */
import { IDb } from './helpers/db/types';
export type IRendererDb<D extends {} = any> = IDb<D> & {
  readonly checkoutVersion?: string;
  dispose(): void;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
};

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
