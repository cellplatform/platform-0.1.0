import { Json, IDisposable } from '@platform/types';
import { Observable } from 'rxjs';

export * from './DbUri/types';

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
  find(query: DbFindArg): Promise<IDbFindResult>;
};

export type IDbWrite = {
  put(key: string, value?: Json, options?: IDbPutOptions): Promise<IDbValue>;
  putMany(items: IDbPutItem[]): Promise<IDbValue[]>;
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

export type IDbPutItem = IDbKeyValue & IDbPutOptions;
export type IDbPutOptions = {
  createdAt?: number;
  modifiedAt?: number;
};

/**
 * Find
 */
export type IDbQuery = { query?: string };
export type DbFindArg = IDbQuery | string;

export type IDbFindResult = {
  length: number;
  keys: string[];
  list: IDbValue[];
  map: { [key: string]: Json | undefined };
  error?: Error;
};

/**
 * Events
 */
export type DbEvent = DocDbActionEvent;
export type DocDbActionEvent = IDbReadEvent | IDbChangeEvent;

export type IDbReadEvent = {
  type: 'DOC/read';
  payload: IDbActionGet;
};

export type IDbChangeEvent = {
  type: 'DOC/change';
  payload: IDbActionChange;
};

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
