import { t, MemoryCache } from '../common';
import { range } from '../range';
import { outgoing } from './refs.outgoing';
import { incoming } from './refs.incoming';

const CellRange = range.CellRange;

type IRefsTableArgs = {
  getKeys: t.RefGetKeys;
  getValue: t.RefGetValue;
};

const CACHE = {
  PREFIX: {
    OUT: 'REFS/table/out/',
    RANGE: 'REFS/table/range/',
  },
  key: {
    out: (suffix: string) => `${CACHE.PREFIX.OUT}${suffix}`,
    range: (suffix: string) => `${CACHE.PREFIX.RANGE}${suffix}`,
  },
  isPrefix(key: string) {
    const prefixes = [CACHE.PREFIX.OUT, CACHE.PREFIX.RANGE];
    return prefixes.some(prefix => key.startsWith(prefix));
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
   * Calculate outgoing references.
   */
  public async outgoing(args: { range?: string; force?: boolean } = {}): Promise<t.IRefsOut> {
    const { force } = args;
    const cache = this.cache;

    const res: t.IRefsOut = {};
    const keys = await this.keys({ range: args.range });
    if (keys.length === 0) {
      return res;
    }

    const wait = keys.map(async key => {
      const getValue = () => outgoing({ key, getValue: this.getValue });
      const refs = await cache.getAsync(CACHE.key.out(key), { getValue, force });
      if (refs.length > 0) {
        res[key] = refs;
      }
      return refs;
    });

    await Promise.all(wait);
    return res;
  }

  /**
   * Calculate incoming references.
   */
  public async incoming(args: { range?: string; force?: boolean } = {}): Promise<t.IRefsIn> {
    const { force } = args;
    const cache = this.cache;
    const getKeys = this.getKeys;

    const res: t.IRefsIn = {};
    const keys = await this.keys({ range: args.range });
    if (keys.length === 0) {
      return res;
    }

    const wait = keys.map(async key => {
      const getValue = () => incoming({ key, getValue: this.getValue, getKeys });
      const refs = await cache.getAsync(CACHE.key.out(key), { getValue, force });
      if (refs.length > 0) {
        res[key] = refs;
      }
      return refs;
    });

    await Promise.all(wait);
    return res;
  }

  /**
   * Clear the cache.
   */
  public reset() {
    this.cache.clear({ filter: CACHE.isPrefix });
    return this;
  }

  /**
   * [Internal]
   */

  private async keys(args: { range?: string }) {
    const keys = await this.getKeys();
    if (args.range) {
      return this.validRange(args.range).keys.filter(key => keys.includes(key));
    } else {
      return keys;
    }
  }

  private validRange(input: string): range.CellRange {
    return this.cache.get(CACHE.key.range(input), () => {
      const range = CellRange.fromKey(input);
      if (range.type !== 'CELL' || !range.isValid) {
        throw new Error(`Table range must be a valid cell range (eg "A1:AZ99").`);
      }
      return range.square;
    });
  }
}
