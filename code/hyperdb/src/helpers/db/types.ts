import { IpcClient } from '@platform/electron/lib/types';
import { Observable } from 'rxjs';

export * from '../../types';

/**
 * [Value]
 */
export type IDbValueMeta<K> = {
  key: K;
  exists: boolean;
  deleted: boolean;
  clock: number[];
  feed: number;
  seq: number;
  path: number[];
  inflate: number;
  trie: any;
};

export type IDbValue<K, V> = {
  value: V | undefined;
  meta: IDbValueMeta<K>;
};

/**
 * [Database]
 */
export type IDbProps = {
  readonly key: string;
  readonly discoveryKey: string;
  readonly localKey: string;
  readonly watching: string[];
  readonly isDisposed: boolean;
};
export type IDbMethods<D extends {} = any> = {
  version(): Promise<string>;
  checkout(version: string): Promise<IDb<D>>;
  get<K extends keyof D>(key: K): Promise<IDbValue<K, D[K]>>;
  put<K extends keyof D>(key: K, value: D[K]): Promise<IDbValue<K, D[K]>>;
  del<K extends keyof D>(key: K): Promise<IDbValue<K, D[K]>>;
  watch(...pattern: string[]): Promise<void>;
  unwatch(...pattern: string[]): Promise<void>;
};
export type IDb<D extends {} = any> = IDbProps &
  IDbMethods<D> & {
    readonly events$: Observable<DbEvent>;
    readonly watch$: Observable<IDbWatchChange<D>>;
  };

/**
 * [Events]
 */
export type DbEvent = IDbErrorEvent | IDbWatchEvent;
export type IDbWatchEvent<D extends {} = any> = {
  type: 'DB/watch';
  payload: IDbWatchChange<D>;
};
export type IDbWatchChange<D extends {} = any> = {
  db: { key: string };
  key: keyof D;
  value?: D[keyof D];
  pattern: string | '*';
  deleted: boolean;
  version: string; // database-version.
};
export type IDbErrorEvent = {
  type: 'DB/error';
  payload: {
    db: { key: string };
    error: Error;
  };
};

/**
 * [IPC] Events
 */

export type DbIpcClient = IpcClient<DbRendererEvent>;
export type DbRendererEvent = IDbGetStateEvent | IDbUpdateStateEvent | IDbInvokeEvent | DbEvent;

export type IDbGetStateEvent = {
  type: 'DB/state/get';
  payload: {
    db: { dir: string; dbKey?: string; checkoutVersion?: string };
    fields?: Array<keyof IDbProps>;
  };
};
export type IDbUpdateStateEvent = {
  type: 'DB/state/update';
  payload: {
    db: { dir: string };
    props: IDbProps;
  };
};
export type IDbInvokeEvent = {
  type: 'DB/invoke';
  payload: {
    db: { dir: string; dbKey?: string; checkoutVersion?: string };
    method: keyof IDbMethods;
    params: any[];
  };
};
export type IDbInvokeResponse<M extends keyof IDbMethods = any> = {
  method: M;
  result?: IDbMethods[M];
  error?: { message: string };
};
