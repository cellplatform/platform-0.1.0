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
export type IDbValueProps = IDbTimestamps & {
  key: string;
  exists: boolean;
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
export type DocDbActionEvent = IDbReadEvent | IDbChangeEvent;

export type IDbReadEvent = {
  type: 'DOC/read';
  payload: IDbActionGet;
};

export type IDbChangeEvent = {
  type: 'DOC/change';
  payload: IDbActionChange;
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
export type IDbActionChange = IDbActionPut | IDbActionDelete;
