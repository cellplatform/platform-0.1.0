import { Json, IDisposable } from '../common/types';
import { Observable } from 'rxjs';

/**
 * Database
 */
export type IDocDb = IDocDbRead & IDocDbWrite & IDisposable & IDocDbEvents;

export type IDocDbRead = {
  get(key: string): Promise<IDocDbValue>;
  getValue(key: string): Promise<Json>;
  getMany(keys: string[]): Promise<IDocDbValue[]>;
  find(args: string | IDocDbFindArgs): Promise<IDocDbFindResult>;
};

export type IDocDbWrite = {
  put(key: string, value?: Json): Promise<IDocDbValue>;
  putMany(items: Array<{ key: string; value?: Json }>): Promise<IDocDbValue[]>;
  delete(key: string): Promise<IDocDbValue>;
};

export type IDocDbEvents = {
  readonly events$: Observable<DocDbEvent>;
};

/**
 * Value
 */
export type IDocDbValue = {
  value?: Json;
  props: IDocDbValueProps;
};
export type IDocDbValueProps = {
  key: string;
  path: string;
  exists: boolean;
  deleted: boolean;
};

/**
 * Find
 */
export type IDocDbFindArgs = {
  pattern?: string;
  deep?: boolean;
};

export type IDocDbFindResult = {
  keys: string[];
  paths: string[];
  list: IDocDbValue[];
  map: { [key: string]: Json | undefined };
};

/**
 * Cache
 */
export type IDocDbCache = {
  isEnabled: boolean;
  values: { [key: string]: IDocDbValue };
  exists(key: string): boolean;
  clear(keys?: string[]): void;
};

/**
 * Events
 */
export type DocDbEvent = DocDbActionEvent | IDocDbCacheKeyRemovedEvent;
export type DocDbActionEvent = IDocDbGetEvent | IDocDbPutEvent | IDocDbDeleteEvent;

export type IDocDbGetEvent = {
  type: 'DB/get';
  payload: IDocDbActionGet;
};

export type IDocDbPutEvent = {
  type: 'DB/put';
  payload: IDocDbActionPut;
};

export type IDocDbDeleteEvent = {
  type: 'DB/delete';
  payload: IDocDbActionDelete;
};

export type IDocDbCacheKeyRemovedEvent = {
  type: 'DB/cache/removed';
  payload: IDocDbCacheKeyRemoved;
};
export type IDocDbCacheKeyRemoved = { key: string; dir: string };

/**
 * Action
 */
export type DocDbAction = IDocDbActionGet | IDocDbActionPut | IDocDbActionDelete;

export type IDocDbAction = {
  key: string;
  value?: Json;
  props: IDocDbValueProps;
};
export type IDocDbActionGet = IDocDbAction & { action: 'get'; cached: boolean };
export type IDocDbActionPut = IDocDbAction & { action: 'put' };
export type IDocDbActionDelete = IDocDbAction & { action: 'delete' };
