import { MemoryCache, R, t } from '../common';
import { outgoing } from './refs.outgoing';
import * as util from './util';

export type IIncomingArgs = {
  key: string;
  getValue: t.RefGetValue;
  getKeys: t.RefGetKeys;
  cache?: t.IMemoryCache;
};

const CACHE = {
  PREFIX: 'REFS/in/',
};

/**
 * Calculate incoming refs for the given cell.
 */
export async function incoming(args: IIncomingArgs): Promise<t.IRefIn[]> {
  const { cache = MemoryCache.create(), getValue } = args;

  // Check if value has been cached.
  const cacheKey = `${CACHE.PREFIX}${args.key}`;
  if (args.cache && args.cache.exists(cacheKey)) {
    return args.cache.get(cacheKey);
  }

  const done = (refs: t.IRefIn[]) => {
    if (args.cache) {
      args.cache.put(cacheKey, refs);
    }
    return refs;
  };

  // Retrieve the set of keys to retrieve.
  const keys = await args.getKeys();
  if (keys.length === 0) {
    return done([]);
  }

  // Walk list of keys finding incoming references.
  const isMatch = (input: string) => util.path(input).includes(args.key);
  const res: t.IRefIn[] = [];
  const wait = keys.map(async cell => {
    if (cell !== args.key) {
      (await outgoing({ key: cell, getValue, cache }))
        .filter(ref => isMatch(ref.path))
        .forEach(ref => res.push({ cell }));
    }
  });

  // Finish up.
  await Promise.all(wait);
  return done(R.uniq(res));
}
