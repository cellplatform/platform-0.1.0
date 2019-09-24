export type IMemoryCache<K extends string> = {
  ttl: number | undefined;
  exists(key: K): boolean;
  get<V>(key: K, defaultValue?: () => V): V;
  put<V>(key: K, value: V): IMemoryCache<K>;
  delete(key: K): IMemoryCache<K>;
  clear(): IMemoryCache<K>;
};
