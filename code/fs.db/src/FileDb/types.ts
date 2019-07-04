import { Json } from '../types';

/**
 * Value
 */
export type IFileDbValue = {
  value?: Json;
  props: IFileDbValueProps;
};
export type IFileDbValueProps = {
  key: string;
  path: string;
  exists: boolean;
  deleted: boolean;
};

/**
 * Find
 */
export type IFileDbFindArgs = {
  pattern?: string;
  recursive?: boolean;
};

export type IFileDbFindResult = {
  keys: string[];
  paths: string[];
  list: IFileDbValue[];
  map: { [key: string]: Json | undefined };
};

/**
 * Cache
 */
export type IFileDbCache = {
  isEnabled: boolean;
  values: { [key: string]: IFileDbValue };
  exists(key: string): boolean;
  clear(keys?: string[]): void;
};

/**
 * Events
 */
export type FileDbActionEvent = IFileDbGetEvent | IFileDbPutEvent | IFileDbDeleteEvent;
export type FileDbEvent = FileDbActionEvent | IFileDbCacheKeyRemovedEvent;

export type IFileDbGetEvent = {
  type: 'DB/get';
  payload: IFileDbActionGet;
};

export type IFileDbPutEvent = {
  type: 'DB/put';
  payload: IFileDbActionPut;
};

export type IFileDbDeleteEvent = {
  type: 'DB/delete';
  payload: IFileDbActionDelete;
};

export type IFileDbCacheKeyRemovedEvent = {
  type: 'DB/cache/removed';
  payload: IFileDbCacheKeyRemoved;
};
export type IFileDbCacheKeyRemoved = { key: string; dir: string };

/**
 * Action
 */
export type FileDbAction = IFileDbActionGet | IFileDbActionPut | IFileDbActionDelete;

export type IFileDbAction = {
  key: string;
  value?: Json;
  props: IFileDbValueProps;
};
export type IFileDbActionGet = IFileDbAction & { action: 'get'; cached: boolean };
export type IFileDbActionPut = IFileDbAction & { action: 'put' };
export type IFileDbActionDelete = IFileDbAction & { action: 'delete' };
