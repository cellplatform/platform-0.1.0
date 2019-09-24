import { t } from '../common';
import { range } from '../range';
import { outgoing } from './refs.outgoing';

const CellRange = range.CellRange;

type IRefsTableArgs = {
  range: string;
  getValue: t.RefGetValue;
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
    this.range = validRange(args.range);
    this.getValue = args.getValue;
  }

  /**
   * [Fields]
   */
  private readonly range: range.CellRange;
  private readonly getValue: t.RefGetValue;
  private cache: t.IRefs = { in: {}, out: {} };

  /**
   * [Methods]
   */
  public async outgoing(args: { range?: string; force?: boolean } = {}): Promise<t.IRefsOut> {
    const getValue = this.getValue;
    const range = args.range ? validRange(args.range) : this.range;

    const cache = this.cache.out;
    const res: t.IRefsOut = {};

    const wait = range.keys.map(async key => {
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
    this.cache = { in: {}, out: {} };
    return this;
  }
}

/**
 * [Helpers]
 */

function validRange(input: string) {
  const range = CellRange.fromKey(input);
  if (range.type !== 'CELL' || !range.isValid) {
    throw new Error(`Table range must be a valid cell range (eg "A1:AZ99").`);
  }
  return range.square;
}
