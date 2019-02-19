import * as t from './types';

/**
 * Filter by [tag]
 */
export function filterByTag(refs: t.IWindowRef[], ...tags: t.IWindowTag[]) {
  const isMatch = (item: t.IWindowTag, tag: t.IWindowTag['tag'], value?: t.IWindowTag['value']) => {
    return value !== undefined && item.value !== value ? false : item.tag === tag;
  };
  return refs.filter(ref =>
    ref.tags.some(a => {
      return tags.some(b => isMatch(a, b.tag, b.value));
    }),
  );
}

export function filterByTagWrangle(refs: t.IWindowRef[], args: any[]) {
  const p1 = args[0];
  const p2 = args[1];
  if (typeof p1 === 'string') {
    const tag = p1 as t.IWindowTag['tag'];
    const value = p2 as t.IWindowTag['value'];
    return filterByTag(refs, { tag, value });
  }
  if (Array.isArray(p1)) {
    return filterByTag(refs, ...p1);
  }
  return filterByTag(refs, ...args);
}

/**
 * Filter by [window-id]
 */
export function filterById(refs: t.IWindowRef[], id: number[]) {
  return refs.filter(ref => id.includes(ref.id));
}
