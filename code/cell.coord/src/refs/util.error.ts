import { R, t } from '../common';

/**
 * Extract all errors from a set of references.
 */
export function toErrors(refs: t.IRefs) {
  return R.flatten(
    Object.keys(refs.out)
      .map(key => refs.out[key])
      .map(refs => refs.map(ref => ref.error as t.IRefError)),
  ).filter(err => err);
}

/**
 * Determine if a circular-error exists.
 */
export function hasCircularError(refs: t.IRefs, key?: string | string[]) {
  return getCircularErrors(refs, key).length > 0;
}

/**
 * Gets a circular error for the given key.
 */
export function getCircularErrors(refs: t.IRefs, key?: string | string[]): t.IRefErrorCircular[] {
  const fromKey = (key: string) => {
    const outRefs = refs.out[key];
    return outRefs
      ? (outRefs.map(ref => ref.error).filter(err => isCircularError(err)) as t.IRefErrorCircular[])
      : [];
  };

  const keys = key === undefined ? Object.keys(refs.out) : Array.isArray(key) ? key : [key];
  const res = keys.reduce(
    (acc, next) => {
      return [...acc, ...fromKey(next)];
    },
    [] as t.IRefErrorCircular[],
  );

  return R.uniqBy(R.prop('path'), res);
}

/**
 * Determine if the given error is a circular-reference error.
 */
export function isCircularError(error?: t.IError) {
  return error && error.type === 'REF/circular';
}
