import { fs } from '../common';

type GrepObject = { grep?: string };

export function GrepList<T extends GrepObject>(list: T[] = []) {
  const all = list.map((item) => ({ ...item, grep: item.grep?.trim() }));
  const assertions = all.filter((item) => !item.grep?.startsWith('!'));
  const negations = all.filter((item) => item.grep?.startsWith('!'));
  return {
    all,
    assertions,
    negations,
    isNegated(path?: string) {
      return path
        ? negations.some((item) => fs.match((item.grep || '').replace(/^!/, '')).path(path))
        : false;
    },
  };
}
