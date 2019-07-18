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
export type DbFactory = (conn: string) => IDb;
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
  payload: { conn: string; keys: string[] };
};

export type IDbIpcFindResponse = { result: IDbFindResult };
export type IDbIpcFindEvent = {
  type: 'DB/find';
  payload: { conn: string; query: IDbQuery };
};

export type IDbIpcPutResponse = { values: IDbValue[] };
export type IDbIpcPutEvent = {
  type: 'DB/put';
  payload: { conn: string; items: IDbKeyValue[] };
};

export type IDbIpcDeleteResponse = { values: IDbValue[] };
export type IDbIpcDeleteEvent = {
  type: 'DB/delete';
  payload: { conn: string; keys: string[] };
};

export type IDbIpcDbFired = { conn: string; event: DbEvent };
export type IDbIpcDbFiredEvent = {
  type: 'DB/fired';
  payload: IDbIpcDbFired;
};

export type IDbIpcOpenFolder = { conn: string };
export type IDbIpcOpenFolderEvent = {
  type: 'DB/open/folder';
  payload: IDbIpcOpenFolder;
};
