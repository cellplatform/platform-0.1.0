import { ast } from '../ast';
import { cell } from '../cell';
import { t, MemoryCache } from '../common';
import { formula } from '../formula';
import { range } from '../range';
import * as util from './util';
import { outgoing } from './refs.outgoing';

export type IIncomingArgs = {
  key: string;
  getValue: t.RefGetValue;
  getKeys: t.RefGetKeys;
  cache?: MemoryCache;
  // path?: string;
};

/**
 * Calculate incoming refs for the given cell.
 */
export async function incoming(args: IIncomingArgs): Promise<t.IRefIn[]> {
  // Check if value has been cached.
  const { cache = MemoryCache.create(), getValue } = args;
  const cacheKey = `REFS/in/${args.key}`;
  if (cache && cache.exists(cacheKey)) {
    return cache.get(cacheKey);
  }

  const keys = await args.getKeys();
  console.log('keys', keys);

  if (keys.length === 0) {
    return [];
  }

  const done = (refs: t.IRefOut[]) => {
    // refs = util.deleteUndefined('error', refs);
    if (cache) {
      cache.put(cacheKey, refs);
    }
    return refs;
  };

  // Walk list of keys creating incoming.
  const f = keys.map(async key => {
    const refs1 = await outgoing({ key, getValue, cache });
    const refs2 = await outgoing({ key, getValue, cache });
    cache.clear();

    console.log('refs', refs1, ' | is', Object.is(refs1, refs2), ' | ===', refs1 === refs2);
    return key;
  });

  const r = await Promise.all(f);
  console.log('f', r);

  // Finish up.
  return done([]);
}
