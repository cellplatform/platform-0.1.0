import { t, MemoryCache } from '../common';
import { range } from '../range';
import { outgoing } from './refs.outgoing';
import { incoming } from './refs.incoming';

const CellRange = range.CellRange;

type IRefsTableArgs = {
  getKeys: t.RefGetKeys;
  getValue: t.RefGetValue;
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
  }

  /**
   * [Fields]
   */
  private readonly getKeys: t.RefGetKeys;
  private readonly getValue: t.RefGetValue;
  private readonly cache = MemoryCache.create();

  /**
   * [Methods]
   */

  /**
   * Calculate incoming/outgoing references.
   */
  public async refs(args: { range?: string; force?: boolean } = {}): Promise<t.IRefs> {
    return {
      in: await this.incoming(args),
      out: await this.outgoing(args),
    };
  }

  /**
   * Calculate incoming references.
   */
  public async incoming(args: { range?: string; force?: boolean } = {}): Promise<t.IRefsIn> {
    const getValue = this.getValue;
    const getKeys = this.getKeys;
    return this.calc<t.IRefIn>({
      ...args,
      cache: key => CACHE.key('IN', key),
      find: key => incoming({ key, getValue, getKeys }),
    });
  }

  /**
   * Calculate outgoing references.
   */
  public async outgoing(args: { range?: string; force?: boolean } = {}): Promise<t.IRefsOut> {
    const getValue = this.getValue;
    return this.calc<t.IRefOut>({
      ...args,
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
   * [Internal]
   */

  private async calc<T>(args: {
    cache: (key: string) => string;
    find: (key: string) => Promise<T[]>;
    range?: string;
    force?: boolean;
  }): Promise<{ [key: string]: T[] }> {
    const { force, range } = args;
    const res: { [key: string]: T[] } = {};

    const keys = await this.keys({ range });
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

  private async keys(args: { range?: string }) {
    const keys = await this.getKeys();
    if (args.range) {
      return this.validRange(args.range).keys.filter(key => keys.includes(key));
    } else {
      return keys;
    }
  }

  private validRange(input: string): range.CellRange {
    return this.cache.get(CACHE.key('RANGE', input), () => {
      const range = CellRange.fromKey(input);
      if (range.type !== 'CELL' || !range.isValid) {
        throw new Error(`Table range must be a valid cell range (eg "A1:AZ99").`);
      }
      return range.square;
    });
  }
}
