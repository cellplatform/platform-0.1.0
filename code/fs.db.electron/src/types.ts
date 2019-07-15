import { IpcClient } from '@platform/electron/lib/types';
import {
  DbEvent,
  IDb,
  IDbFindResult,
  IDbKeyValue,
  IDbQuery,
  IDbValue,
} from '@platform/fs.db/lib/types';

export type DbIpc = IpcClient<DbIpcEvent>;
export type DbFactory = (dir: string) => IDb;
export type DbKind = 'FSDB' | 'NEDB';

/**
 * IPC Events
 */
export type DbIpcEvent =
  | IDbIpcGetEvent
  | IDbIpcFindEvent
  | IDbIpcPutEvent
  | IDbIpcDeleteEvent
  | IDbIpcDbFiredEvent
  | IDbIpcOpenFolderEvent;

export type IDbIpcGetResponse = { values: IDbValue[] };
export type IDbIpcGetEvent = {
  type: 'DB/get';
  payload: { db: string; keys: string[] };
};

export type IDbIpcFindResponse = { result: IDbFindResult };
export type IDbIpcFindEvent = {
  type: 'DB/find';
  payload: { db: string; query: IDbQuery };
};

export type IDbIpcPutResponse = { values: IDbValue[] };
export type IDbIpcPutEvent = {
  type: 'DB/put';
  payload: { db: string; items: IDbKeyValue[] };
};

export type IDbIpcDeleteResponse = { values: IDbValue[] };
export type IDbIpcDeleteEvent = {
  type: 'DB/delete';
  payload: { db: string; keys: string[] };
};

export type IDbIpcDbFired = { db: string; event: DbEvent };
export type IDbIpcDbFiredEvent = {
  type: 'DB/fired';
  payload: IDbIpcDbFired;
};

export type IDbIpcOpenFolder = { db: string };
export type IDbIpcOpenFolderEvent = {
  type: 'DB/open/folder';
  payload: IDbIpcOpenFolder;
};
