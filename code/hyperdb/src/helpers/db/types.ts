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
export type IDb<D extends object = any> = {
  readonly events$: Observable<DbEvent>;
  readonly watch$: Observable<IDbWatchChange<D>>;
  readonly key: string;
  readonly discoveryKey: string;
  readonly localKey: string;
  readonly watching: string[];
  version(): Promise<string>;
};

/**
 * [Events]
 */
export type DbEvent = IDbErrorEvent | IDbWatchEvent;
export type IDbWatchEvent<D extends object = any> = {
  type: 'DB/watch';
  payload: IDbWatchChange<D>;
};
export type IDbWatchChange<D extends object = any> = {
  key: keyof D;
  value?: D[keyof D];
  pattern: string | '*';
  deleted: boolean;
  version: string; // database-version.
};

export type IDbErrorEvent = {
  type: 'DB/error';
  payload: { error: Error };
};
