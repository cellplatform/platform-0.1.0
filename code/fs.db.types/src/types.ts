import { Json, IDisposable } from '@platform/types';
import { Observable } from 'rxjs';

export type IDbTimestamps = {
  createdAt: number;
  modifiedAt: number;
};

/**
 * Database
 */
export type IDb = IDbRead & IDbWrite & IDisposable & IDbEvents;

export type IDbRead = {
  get(key: string): Promise<IDbValue>;
  getValue<T extends Json | undefined>(key: string): Promise<T>;
  getMany(keys: string[]): Promise<IDbValue[]>;
  find(query: string | IDbQuery): Promise<IDbFindResult>;
};

export type IDbWrite = {
  put(key: string, value?: Json): Promise<IDbValue>;
  putMany(items: IDbKeyValue[]): Promise<IDbValue[]>;
  delete(key: string): Promise<IDbValue>;
  deleteMany(keys: string[]): Promise<IDbValue[]>;
};

export type IDbEvents = {
  readonly events$: Observable<DbEvent>;
};

/**
 * Value
 */
export type IDbValue = {
  value?: Json;
  props: IDbValueProps;
};
export type IDbValueProps = {
  key: string;
  exists: boolean;
  deleted: boolean;
};

export type IDbKeyValue = {
  key: string;
  value?: Json;
};

/**
 * Find
 */
export type IDbQuery = {
  pattern?: string;
  deep?: boolean;
};

export type IDbFindResult = {
  keys: string[];
  list: IDbValue[];
  map: { [key: string]: Json | undefined };
};

/**
 * Cache
 */
export type IDbCache = {
  isEnabled: boolean;
  values: { [key: string]: IDbValue };
  exists(key: string): boolean;
  clear(keys?: string[]): void;
};

/**
 * Events
 */
export type DbEvent = DocDbActionEvent | IDbCacheEvent;
export type DocDbActionEvent = IDbGetEvent | IDbPutEvent | IDbDeleteEvent;

export type IDbGetEvent = {
  type: 'DOC/get';
  payload: IDbActionGet;
};

export type IDbPutEvent = {
  type: 'DOC/put';
  payload: IDbActionPut;
};

export type IDbDeleteEvent = {
  type: 'DOC/delete';
  payload: IDbActionDelete;
};

export type IDbCacheEvent = {
  type: 'DOC/cache';
  payload: IDbCacheAction;
};
export type IDbCacheAction = { key: string; action: 'REMOVED' };

/**
 * Action
 */
export type DocDbAction = IDbActionGet | IDbActionPut | IDbActionDelete;

export type IDbAction = {
  key: string;
  value?: Json;
  props: IDbValueProps;
};
export type IDbActionGet = IDbAction & { action: 'get' };
export type IDbActionPut = IDbAction & { action: 'put' };
export type IDbActionDelete = IDbAction & { action: 'delete' };
