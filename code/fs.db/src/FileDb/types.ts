import { Json } from '../types';

/**
 * FileDb
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
 * Events
 */
export type FileDbEvent = IFileDbGetEvent | IFileDbPutEvent | IFileDbDeleteEvent;

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

/**
 * Action
 */
export type FileDbAction = IFileDbActionGet | IFileDbActionPut | IFileDbActionDelete;

export type IFileDbAction = {
  key: string;
  value?: Json;
  props: IFileDbValueProps;
};
export type IFileDbActionGet = IFileDbAction & { action: 'get' };
export type IFileDbActionPut = IFileDbAction & { action: 'put' };
export type IFileDbActionDelete = IFileDbAction & { action: 'delete' };
