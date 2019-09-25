import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as t from '../types';

export type IMemoryCacheArgs = { ttl?: number };
type CacheItem<V> = {
  value?: V;
  put$: Subject<{}>;
};

export class MemoryCache<K extends string = string> implements t.IMemoryCache<K> {
  /**
   * [Lifecycle]
   */
  public static create<K extends string = string>(args?: IMemoryCacheArgs): t.IMemoryCache<K> {
    return new MemoryCache<K>(args);
  }
  public constructor(args: IMemoryCacheArgs = {}) {
    this.ttl = args.ttl;
  }

  /**
   * [Fields]
   */
  private values: { [key: string]: CacheItem<any> } = {};
  public readonly ttl: number | undefined;

  /**
   * [Properties]
   */
  public get keys() {
    return Object.keys(this.values);
  }

  /**
   * [Methods]
   */
  public exists(key: K) {
    return Boolean(this.values[key] && this.values[key].value);
  }

  public get<V>(key: K, args?: t.MemoryCacheGetValue<V> | t.IMemoryCacheGetOptions<V>): V {
    const res = this.getItem<V>(key, args);
    if (res.retrieved) {
      this.put(key, res.value);
    }
    return res.value;
  }

  public async getAsync<V>(
    key: K,
    args?: t.MemoryCacheGetValue<V> | t.IMemoryCacheGetOptions<V>,
  ): Promise<V> {
    const res = this.getItem<V>(key, args);
    if (res.retrieved) {
      this.put(key, isPromise(res.value) ? await res.value : res.value);
    }
    return res.value;
  }

  public put<V>(key: K, value: V) {
    const item = this.item(key);
    item.value = value;
    item.put$.next();
    if (typeof this.ttl === 'number') {
      timer(this.ttl)
        .pipe(takeUntil(item.put$))
        .subscribe(e => this.delete(key));
    }
    return this;
  }

  public delete(key: K) {
    delete this.values[key];
    return this;
  }

  public clear(args: { filter?: t.MemoryCacheFilter } = {}) {
    const { filter } = args;
    if (filter) {
      Object.keys(this.values)
        .filter(filter)
        .forEach(key => delete this.values[key]);
    } else {
      this.values = {};
    }
    return this;
  }

  /**
   * [Internal]
   */
  private item<V>(key: K): CacheItem<V> {
    if (!this.values[key]) {
      this.values[key] = { put$: new Subject() };
    }
    return this.values[key];
  }

  private getItem<V>(key: K, args?: t.MemoryCacheGetValue<V> | t.IMemoryCacheGetOptions<V>) {
    const getValue = typeof args === 'function' ? args : args ? args.getValue : undefined;
    const force = typeof args === 'object' ? args.force : false;
    let value: any = this.item<V>(key).value;
    const retrieved = typeof getValue === 'function' && (force || value === undefined);
    if (retrieved && typeof getValue === 'function') {
      value = getValue();
    }

    return { value, retrieved };
  }
}

/**
 * [Helpers]
 */

function isPromise(value: any) {
  return typeof value === 'object' && typeof (value as any).then === 'function';
}
