import * as t from './common/types';

export * from '@platform/cell.types/lib/types/types.fs.sync';

/**
 * Config
 */
export type IFsConfigDir = {
  exists: boolean | null;
  isValid: boolean;
  dir: string;
  file: string;
  data: IFsConfigDirData;
  target: {
    uri: t.IUriParts<t.ICellUri>;
    url: string;
  };
  load(): Promise<IFsConfigDir>;
  save(data?: IFsConfigDirData): Promise<IFsConfigDir>;
  validate(): IFsConfigDirValidation;
};

export type IFsConfigDirData = {
  host: string;
  target: string; // URI: ns|cell
};

export type IFsConfigDirValidation = {
  isValid: boolean;
  errors: t.IError[];
};

/**
 * CLI
 */
export type IFsSyncResults = { uploaded: string[]; deleted: string[] };
export type FsSyncLogResults = (args: Partial<IFsSyncResults>) => void;

export type FsSyncGetPayload = (args: IFsSyncGetPayloadArgs) => Promise<IFsSyncPayload>;
export type IFsSyncGetPayloadArgs = {
  config: IFsConfigDir;
  silent?: boolean;
  force?: boolean;
  delete?: boolean;
};

export type FsSyncRun = (args: IFsSyncRunArgs) => Promise<IFsRunSyncResponse>;
export type FsSyncRunCurry = (override?: Partial<IFsSyncRunArgs>) => Promise<IFsRunSyncResponse>;

export type IFsSyncRunArgs = {
  config: t.IFsConfigDir;
  dir: string;
  prompt: boolean;
  maxBytes: number;
  silent?: boolean;
  force?: boolean;
  delete?: boolean;
  onPayload?: (payload: IFsSyncPayload) => void;
};

export type IFsRunSyncResponse = {
  ok: boolean;
  errors: t.ITaskError[];
  count: IFsSyncCount;
  bytes: number;
  completed: boolean;
  results: IFsSyncResults;
};

export type IFsSyncCount = {
  readonly total: number;
  readonly uploaded: number;
  readonly deleted: number;
};

export type FsSyncFileStatus = 'ADDED' | 'CHANGED' | 'NO_CHANGE' | 'DELETED';
export type IFsSyncPayloadFile = {
  status: FsSyncFileStatus;
  isChanged: boolean;
  localPath: string;
  path: string;
  dir: string;
  filename: string;
  filehash: string;
  uri: string;
  url: string;
  data?: Buffer;
  localBytes: number;
  remoteBytes: number;
};
export type IFsSyncPayload = {
  ok: boolean;
  files: IFsSyncPayloadFile[];
  log(): string;
};
