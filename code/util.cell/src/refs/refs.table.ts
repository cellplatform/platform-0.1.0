import { t, MemoryCache, R } from '../common';
import { range } from '../range';
import { outgoing } from './refs.outgoing';
import { incoming } from './refs.incoming';
import { cell } from '../cell';

const CellRange = range.CellRange;

type IRefsTableArgs = {
  getKeys: t.RefGetKeys;
  getValue: t.RefGetValue;
  cache?: t.IMemoryCache;
};

type CacheKeyType = t.RefDirection | 'RANGE';

const CACHE = {
  PREFIX: {
    IN: 'REFS/table/in/',
    OUT: 'REFS/table/out/',
    RANGE: 'REFS/table/range/',
  },
  prefix(type: CacheKeyType) {
    const prefix = CACHE.PREFIX[type];
    if (!prefix) {
      throw new Error(`Cache key type '${type}' not supported.`);
    }
    return prefix;
  },
  key(type: CacheKeyType, suffix: string) {
    return `${CACHE.prefix(type)}${suffix}`;
  },
  isPrefix(types: CacheKeyType[], key: string) {
    return types.map(type => CACHE.prefix(type)).some(prefix => key.startsWith(prefix));
  },
};

/**
 * Calculate cached references for a table.
 */
export function table(args: IRefsTableArgs): t.IRefsTable {
  return new RefsTable(args);
}

class RefsTable implements t.IRefsTable {
  /**
   * [Lifecycle]
   */
  constructor(args: IRefsTableArgs) {
    this.getKeys = args.getKeys;
    this.getValue = args.getValue;
    this.cache = args.cache || MemoryCache.create();
  }

  /**
   * [Fields]
   */
  private readonly getKeys: t.RefGetKeys;
  private readonly getValue: t.RefGetValue;
  private readonly cache: t.IMemoryCache;

  /**
   * [Methods]
   */

  /**
   * Calculate incoming/outgoing references.
   */
  public async refs(args: { range?: string; force?: boolean } = {}): Promise<t.IRefs> {
    const outRefs = await this.outgoing(args);
    const inRefs = await this.incoming({ ...args, outRefs });

    return {
      in: inRefs,
      out: outRefs,
    };
  }

  /**
   * Calculate incoming references.
   */
  public async incoming(
    args: { range?: string | string[]; force?: boolean; outRefs?: t.IRefsOut } = {},
  ): Promise<t.IRefsIn> {
    const { range, outRefs } = args;
    const getValue = this.getValue;
    const keys = await this.filterKeys({ range, outRefs });
    return this.calc<t.IRefIn>({
      ...args,
      keys,
      cache: key => CACHE.key('IN', key),
      find: key => incoming({ key, getValue, getKeys: async () => keys }),
    });
  }

  /**
   * Calculate outgoing references.
   */
  public async outgoing(args: { range?: string; force?: boolean } = {}): Promise<t.IRefsOut> {
    const { range } = args;
    const getValue = this.getValue;
    const keys = await this.filterKeys({ range });
    return this.calc<t.IRefOut>({
      ...args,
      keys,
      cache: key => CACHE.key('OUT', key),
      find: key => outgoing({ key, getValue }),
    });
  }

  /**
   * Clear the cache.
   */
  public reset(args: { cache?: t.RefDirection[] } = {}) {
    const types = args.cache || ['IN', 'OUT'];
    this.cache.clear({ filter: key => CACHE.isPrefix(types, key) });
    return this;
  }

  /**
   * Determines if refs for the specified cell is cached.
   */
  // TEMP 🐷 - DELETE
  // public cached(args: { key: string }) {
  //   const { key } = typeof args === 'object' ? args : { key: args };
  //   return [
  //     this.cache.exists(CACHE.key('IN', key)) ? 'IN' : undefined,
  //     this.cache.exists(CACHE.key('OUT', key)) ? 'OUT' : undefined,
  //   ].filter(e => Boolean(e)) as t.RefDirection[];
  // }

  /**
   * [Internal]
   */

  private async calc<T>(args: {
    keys: string[];
    cache: (key: string) => string;
    find: (key: string) => Promise<T[]>;
    force?: boolean;
  }): Promise<{ [key: string]: T[] }> {
    const { keys, force } = args;
    const res: { [key: string]: T[] } = {};
    if (keys.length === 0) {
      return res;
    }

    const wait = keys.map(async key => {
      const getValue = () => args.find(key);
      const refs = await this.cache.getAsync(args.cache(key), { getValue, force });
      if (refs.length > 0) {
        res[key] = refs;
      }
      return refs;
    });

    await Promise.all(wait);
    return res;
  }

  private async filterKeys(args: { range?: string | string[]; outRefs?: t.IRefsOut }) {
    const { range, outRefs } = args;
    const keys = await this.getKeys();
    const cache = this.cache;
    return RefsTable.filterKeys({ keys, range, outRefs, cache });
  }
  public static filterKeys(args: {
    keys: string[];
    range?: string | string[];
    outRefs?: t.IRefsOut;
    cache?: t.IMemoryCache;
  }) {
    const { outRefs } = args;
    let keys = args.keys;

    // Narrow on range (if given).
    if (args.range) {
      const rangeKeys = (Array.isArray(args.range) ? args.range : [args.range]).map(key => {
        return cell.isCell(key) || cell.isColumn(key) || cell.isRow(key) ? `${key}:${key}` : key;
      });
      const union = toRangeUnion(rangeKeys, args.cache);
      keys = keys.filter(key => union.contains(key));
    }

    // Merge in keys from outgoing-refs (if given).
    if (outRefs) {
      Object.keys(outRefs)
        .map(key => outRefs[key])
        .forEach(items => {
          items.forEach(item => {
            keys = [...keys, ...item.path.split('/')];
          });
        });
      keys = R.uniq(keys);
    }

    // Finish up.
    return keys;
  }
}

/**
 * [Helpers]
 */
function toRangeUnion(keys: string[], cache?: t.IMemoryCache) {
  const create = () => range.union(keys);
  const cacheKey = CACHE.key('RANGE', keys.join(','));
  return cache ? cache.get(cacheKey, create) : create();
}
