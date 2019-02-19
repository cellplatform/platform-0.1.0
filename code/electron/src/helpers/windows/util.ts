import * as t from './types';

/**
 * Filter
 */
export function filterByTag(
  refs: t.IWindowRef[],
  tag: t.IWindowTag['tag'],
  value?: t.IWindowTag['value'],
) {
  return refs.filter(ref =>
    ref.tags.some(item => {
      if (value !== undefined && item.value !== value) {
        return false;
      }
      return item.tag === tag;
    }),
  );
}
