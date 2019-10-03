import { ast } from '../ast';
import { R, t, toposort } from '../common';

/**
 * Removed `undefined` values of the given field from a list of items.
 */
export function deleteUndefined<T>(field: keyof T, items: T[]) {
  items.forEach(ref => {
    if (ref[field] === undefined) {
      delete ref[field];
    }
  });
  return items;
}

/**
 * Helpers for working with a path (eg "A1/D5/C3").
 */
export function path(input?: string) {
  let keys: string[] | undefined;
  const path = input || '';
  const res = {
    path,
    get keys() {
      return keys || (keys = path.split('/').filter(part => part));
    },
    get first() {
      return res.keys[0];
    },
    get last() {
      return res.keys[res.keys.length - 1];
    },
    isCircular(key: string | string[]) {
      const keys = Array.isArray(key) ? key : [key];
      return keys.some(key => res.keys.includes(key));
    },
  };
  return res;
}

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
export function hasCircularError(refs: t.IRefs, key?: string) {
  if (key) {
    return Boolean(getCircularError(refs, key));
  } else {
    return toErrors(refs).some(err => isCircularError(err));
  }
}

/**
 * Gets a circular error for the given key.
 */
export function getCircularError(refs: t.IRefs, key: string) {
  const outRefs = refs.out[key];
  return outRefs ? outRefs.map(ref => ref.error).find(error => isCircularError(error)) : undefined;
}

/**
 * Determine if the given error is a circular-reference error.
 */
export function isCircularError(error?: t.IRefError) {
  return error && error.type === 'CIRCULAR';
}

/**
 * Determine if the given cell value represents a formula.
 */
export function isFormula(input?: any) {
  return (typeof input === 'string' ? input : '')[0] === '=';
}

/**
 * Determine if the given input represents a "function" or "binary-expression"
 * (eg "=SUM(1,A1)" or "=1+A1")
 */
export function isFunc(input?: string | ast.TreeNode) {
  return toRefTarget(input) === 'FUNC';
}

/**
 * Determine if the given input represents a cell reference (eg "=A1")
 */
export function isRef(input?: string | ast.TreeNode) {
  return toRefTarget(input) === 'REF';
}

/**
 * Determine if the given input represents a cell reference (eg "=A1:Z9")
 */
export function isRange(input?: string | ast.TreeNode) {
  return toRefTarget(input) === 'RANGE';
}

/**
 * Determine the type of reference-target the given value is.
 */
export function toRefTarget(
  input: string | ast.TreeNode | undefined,
  defaultValue: t.RefTarget = 'UNKNOWN',
): t.RefTarget {
  if (input) {
    const node = typeof input === 'object' ? input : ast.toTree(input);
    switch (node.type) {
      case 'function':
      case 'binary-expression':
        return 'FUNC';
      case 'cell':
        return 'REF';
      case 'cell-range':
        return 'RANGE';
      default:
        return 'VALUE';
    }
  } else {
    return defaultValue;
  }
}

/**
 * Incoming specific helpers.
 */
export const incoming = {
  listToKeys: (list: t.IRefIn[]) => list.map(ref => ref.cell),
  refsToKeyList: (refs: t.IRefsIn) => Object.keys(refs).map(key => ({ key, refs: refs[key] })),
};

/**
 * Outgoing specific helpers.
 */
export const outgoing = {
  listToKeys: (list: t.IRefOut[]) => R.flatten(list.map(ref => path(ref.path).keys)),
  refsToKeyList: (refs: t.IRefsOut) => Object.keys(refs).map(key => ({ key, refs: refs[key] })),
  refsToFlatList: (refs: t.IRefsOut) => R.flatten(Object.keys(refs).map(key => refs[key])),
  refsToAllKeys: (refs: t.IRefsOut) => outgoing.listToKeys(outgoing.refsToFlatList(refs)),
};

/**
 * Performs a topological sort on the given cells based
 * on the dependency graph of the cell's references.
 *
 * Order:
 *    LEAST-dependent => MOST-dependent
 */
export function sort(args: { refs: t.IRefs }) {
  let errors: t.IRefError[] = [];

  // Build input list of [to:from] key pairs.
  const graph: string[][] = incoming.refsToKeyList(args.refs.in).reduce(
    (acc, { key, refs }) => {
      refs.forEach(ref => {
        // Check for error.
        // NB: Circular-ref will cause `toposort` to fail, don't include it.
        const error = getCircularError(args.refs, key);
        if (error) {
          errors.push(error);
        }
        const from = error ? '' : ref.cell;
        acc.push([key, from]);
      });
      return acc;
    },
    [] as string[][],
  );

  // Run the topological sort.
  const keys = toposort(graph).filter(key => key); // NB: Filter out any "empty" circular-ref entries.

  // Finish up.
  const ok = errors.length === 0;
  errors = ok ? errors : R.uniqBy(R.prop('path'), errors);
  return { ok, keys, errors };
}
