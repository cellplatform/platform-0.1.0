import { Subject } from 'rxjs';
import { filter, share, takeUntil } from 'rxjs/operators';

import { cell } from '../cell';
import { MemoryCache, R, t } from '../common';
import { range } from '../range';
import { incoming } from './refs.incoming';
import { outgoing } from './refs.outgoing';

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
    this._getKeys = args.getKeys;
    this._getValue = args.getValue;
    this._cache = args.cache || MemoryCache.create();
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */

  private readonly _getKeys: t.RefGetKeys;
  private readonly _getValue: t.RefGetValue;
  private readonly _cache: t.IMemoryCache;

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.RefsTableEvent>();
  public readonly events$ = this._events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  /**
   * [Methods]
   */

  /**
   * Calculate incoming/outgoing references.
   */
  public async refs(args: { range?: string | string[]; force?: boolean } = {}): Promise<t.IRefs> {
    this.throwIfDisposed('refs');
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
    this.throwIfDisposed('incoming');
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
  public async outgoing(
    args: { range?: string | string[]; force?: boolean } = {},
  ): Promise<t.IRefsOut> {
    this.throwIfDisposed('outgoing');
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
    this.throwIfDisposed('reset');
    const types = args.cache || ['IN', 'OUT'];
    this._cache.clear({ filter: key => CACHE.isPrefix(types, key) });
    return this;
  }

  /**
   * Recalculate the table for the given change(s).
   */
  public async update(args: t.IRefsUpdateArgs) {
    const changes: t.IRefsUpdateArgs[] = Array.isArray(args) ? args : [args];
    const keys = R.uniq(changes.map(change => change.key));

    // Get the current set of refs (prior to any updates).
    const beforeRefs = await this.refs(); // NB: Not forced, pick up from cache.

    // Calculate set of existing refs (IN/OUT) prior to any updates.
    const refsToKeys = (refs: t.IRefs) => {
      const inKeys = util.incoming
        .refsToKeyList(refs.in)
        .map(({ key, refs }) => ({ key, refs: util.incoming.listToKeys(refs) }))
        .filter(e => e.refs.some(key => keys.includes(key)))
        .map(e => e.key);
      const outKeys = util.outgoing.refsToAllKeys(refs.out);
      return R.uniq([...inKeys, ...outKeys]);
    };
    let refreshKeys: string[] = refsToKeys(beforeRefs);

    // Perform an OUTGOING update of the given cell and include the resulting
    // outgoing-refs in the set of cells that need to be refreshed.
    const updateOutRefs = async (key: string) => {
      const outRefs = await this.outgoing({ range: key, force: true });
      refreshKeys = [...refreshKeys, ...util.outgoing.refsToAllKeys(outRefs)];
    };
    await Promise.all(keys.map(key => updateOutRefs(key)));
    refreshKeys = R.uniq(refreshKeys);

    // 🌳 Perform a refresh of all referenced cells implicated in the change(s).
    const refs = await this.refs({ range: refreshKeys, force: true });

    // Read out any errors that may exist after the update.
    const errors: t.IRefError[] = R.flatten(
      Object.keys(refs.out)
        .map(key => refs.out[key])
        .map(refs => refs.map(ref => ref.error as t.IRefError)),
    ).filter(err => err);

    // Finish up.
    const res: t.RefsUpdate = {
      ok: errors.length === 0,
      changed: changes,
      keys: refreshKeys,
      refs,
      errors,
    };
    return res;
  }

  /**
   * [Internal]
   */
  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because RefsTable is disposed.`);
    }
  }

  private fire(e: t.RefsTableEvent) {
    this._events$.next(e);
  }

  private getKeys: t.RefGetKeys = async () => {
    let keys = await this._getKeys();
    const payload: t.IRefsTableGetKeys = {
      get keys() {
        return keys;
      },
      isModified: false,
      modify(change: string[]) {
        payload.isModified = true;
        keys = R.uniq(change);
      },
    };
    this.fire({ type: 'REFS/table/getKeys', payload });
    return keys;
  };

  private getValue: t.RefGetValue = async (key: string) => {
    let value = await this._getValue(key);
    const payload: t.IRefsTableGetValue = {
      key,
      get value() {
        return value;
      },
      isModified: false,
      modify(change?: string) {
        payload.isModified = true;
        value = change;
      },
    };
    this.fire({ type: 'REFS/table/getValue', payload });
    return value;
  };

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
      const refs = await this._cache.getAsync(args.cache(key), { getValue, force });
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
    const cache = this._cache;
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

const util = {
  pathToKeys: (path?: string) => (path || '').split('/').filter(part => part),
  incoming: {
    listToKeys: (list: t.IRefIn[]) => list.map(ref => ref.cell),
    refsToKeyList: (refs: t.IRefsIn) => Object.keys(refs).map(key => ({ key, refs: refs[key] })),
  },
  outgoing: {
    listToKeys: (list: t.IRefOut[]) => R.flatten(list.map(ref => util.pathToKeys(ref.path))),
    refsToKeyList: (refs: t.IRefsOut) => Object.keys(refs).map(key => ({ key, refs: refs[key] })),
    refsToFlatList: (refs: t.IRefsOut) => R.flatten(Object.keys(refs).map(key => refs[key])),
    refsToAllKeys: (refs: t.IRefsOut) =>
      util.outgoing.listToKeys(util.outgoing.refsToFlatList(refs)),
  },
};

// /**
//  * Helpers for evaluating INCOMING refs.
//  */
// export class RefsIn {
//   /**
//    * [Lifecycle]
//    */
//   constructor(args: { refs: t.IRefsIn }) {
//     this.refs = args.refs;
//   }

//   /**
//    * [Fields]
//    */
//   public readonly refs: t.IRefsIn;

//   /**
//    * [Methods]
//    */
// }

// /**
//  * Helpers for evaluating INCOMING refs.
//  */
// export class RefOut {
//   /**
//    * [Lifecycle]
//    */
//   constructor(args: { refs: t.IRefsOut }) {
//     this.refs = args.refs;
//   }

//   /**
//    * [Fields]
//    */
//   public readonly refs: t.IRefsOut;

//   /**
//    * [Methods]
//    */
// }
