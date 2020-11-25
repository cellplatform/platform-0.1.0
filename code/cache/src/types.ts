/**
 * In-Memory Cache
 */
export type MemoryCacheFilter = (key: string) => boolean;
export type MemoryCacheGetValue<V> = () => V;

export type IMemoryCacheGetOptions<V> = {
  getValue?: MemoryCacheGetValue<V>;
  force?: boolean;
};

export type IMemoryCache<K extends string = string> = {
  readonly ttl: number | undefined;
  readonly keys: string[];
  exists(key: K): boolean;
  get<V>(key: K, args?: MemoryCacheGetValue<V> | IMemoryCacheGetOptions<V>): V;
  getAsync<V>(key: K, args?: MemoryCacheGetValue<V> | IMemoryCacheGetOptions<V>): Promise<V>;
  put<V>(key: K, value: V): IMemoryCache<K>;
  delete(key: K): IMemoryCache<K>;
  clear(args?: { filter?: MemoryCacheFilter }): IMemoryCache<K>;
  clone(): IMemoryCache<K>;
};

/**
 * File System Cache
 */
export type IFileCache = {
  readonly dir: string;
  file(path: string): ICachedFile;
  exists(path: string): Promise<boolean>;
  get(path: string): Promise<Uint8Array | undefined>;
  put(path: string, data: string | Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  clear(): Promise<void>;
};

export type ICachedFile = {
  readonly dir: string;
  readonly path: string;
  exists(): Promise<boolean>;
  get(): Promise<Uint8Array | undefined>;
  put(data: string | Uint8Array): Promise<void>;
  delete(): Promise<void>;
};
