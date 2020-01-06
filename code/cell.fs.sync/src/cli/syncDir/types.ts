import * as t from '../../common/types';
export * from '../../common/types';

export type LogResults = (args: { uploaded?: string[]; deleted?: string[] }) => void;

export type IRunSyncArgs = {
  config: t.IFsConfigDir;
  dir: string;
  force: boolean;
  silent: boolean;
  delete: boolean;
};

export type SyncCount = {
  readonly total: number;
  readonly uploaded: number;
  readonly deleted: number;
};

export type Status = 'ADDED' | 'CHANGED' | 'NO_CHANGE' | 'DELETED';

export type IPayloadItem = {
  status: Status;
  isPending: boolean;
  filename: string;
  path: string;
  url: string;
  data?: Buffer;
  bytes: number;
};
