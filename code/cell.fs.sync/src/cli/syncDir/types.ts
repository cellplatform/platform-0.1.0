import * as t from '../../common/types';

export * from '../../common/types';

export type ISyncResults = { uploaded: string[]; deleted: string[] };
export type LogSyncResults = (args: Partial<ISyncResults>) => void;

export type RunSync = (args: IRunSyncArgs) => Promise<IRunSyncResponse>;
export type RunSyncCurry = (override?: Partial<IRunSyncArgs>) => Promise<IRunSyncResponse>;

export type IRunSyncArgs = {
  config: t.IFsConfigDir;
  dir: string;
  force: boolean;
  silent: boolean;
  delete: boolean;
  prompt: boolean;
  maxBytes: number;
  onPayload?: (payload: IPayload) => void;
};

export type IRunSyncResponse = {
  ok: boolean;
  errors: t.ITaskError[];
  count: ISyncCount;
  bytes: number;
  completed: boolean;
  results: ISyncResults;
};

export type ISyncCount = {
  readonly total: number;
  readonly uploaded: number;
  readonly deleted: number;
};

export type FileStatus = 'ADDED' | 'CHANGED' | 'NO_CHANGE' | 'DELETED';
export type IPayloadFile = {
  status: FileStatus;
  isPending: boolean;
  filename: string;
  filehash: string;
  path: string;
  url: string;
  data?: Buffer;
  bytes: number;
};
export type IPayload = {
  ok: boolean;
  files: IPayloadFile[];
  log(): string;
};
