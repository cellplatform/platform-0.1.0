export type MemoryCacheFilter = (key: string) => boolean;
export type MemoryCacheDefault<V> = () => V;

export type IMemoryCacheGetOptions<V> = {
  defaultValue?: MemoryCacheDefault<V>;
  force?: boolean;
};

export type IMemoryCache<K extends string = string> = {
  readonly ttl: number | undefined;
  readonly keys: string[];
  exists(key: K): boolean;
  get<V>(key: K, args?: MemoryCacheDefault<V> | IMemoryCacheGetOptions<V>): V;
  put<V>(key: K, value: V): IMemoryCache<K>;
  delete(key: K): IMemoryCache<K>;
  clear(args?: { filter?: MemoryCacheFilter }): IMemoryCache<K>;
};
