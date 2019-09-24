import { t } from '../common';
import { range } from '../range';
import { outgoing } from './refs.outgoing';

const CellRange = range.CellRange;

type IRefsTableArgs = {
  getKeys: t.RefGetKeys;
  getValue: t.RefGetValue;
};

type Cache = {
  refs: t.IRefs;
  ranges: { [key: string]: range.CellRange };
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

  private cache: Cache = {
    refs: { in: {}, out: {} },
    ranges: {},
  };

  /**
   * [Methods]
   */
  public async outgoing(args: { range?: string; force?: boolean } = {}): Promise<t.IRefsOut> {
    const getValue = this.getValue;
    const cache = this.cache.refs.out;

    const res: t.IRefsOut = {};
    const keys = await this.keys({ range: args.range });
    if (keys.length === 0) {
      return res;
    }

    const wait = keys.map(async key => {
      if (!cache[key] || args.force) {
        const refs = await outgoing({ key, getValue });
        if (refs.length > 0) {
          cache[key] = refs;
        }
      }
      if (cache[key]) {
        res[key] = cache[key];
      }
    });

    await Promise.all(wait);
    return res;
  }

  public reset() {
    this.cache.refs = { in: {}, out: {} };
    this.cache.ranges = {};
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
    if (this.cache.ranges[input]) {
      return this.cache.ranges[input];
    }

    const range = CellRange.fromKey(input);
    if (range.type !== 'CELL' || !range.isValid) {
      throw new Error(`Table range must be a valid cell range (eg "A1:AZ99").`);
    }

    return (this.cache.ranges[input] = range.square);
  }
}
