import { ast } from '../ast';
import { R, t } from '../common';

/**
 *  binary-expression    1+2
 *  cell                 =A1
 *  cell-range           A1:B9
 *  function             =SUM(1,2,3)
 *  logical              TRUE/FALSE
 *  number               123
 *  text                 "hello"
 *  unary-expression     -TRUE
 */
const VALUE_TYPES: Array<ast.Node['type']> = ['number', 'text', 'logical', 'unary-expression'];

/**
 * Determine if the given node represents a concrete value.
 */
export function isValueNode(node: ast.Node) {
  return VALUE_TYPES.includes(node.type);
}

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
 * Convert a path (eg "A1/D5/C3") to individual keys.
 */
export function pathToKeys(path?: string) {
  return (path || '').split('/').filter(part => part);
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
  listToKeys: (list: t.IRefOut[]) => R.flatten(list.map(ref => pathToKeys(ref.path))),
  refsToKeyList: (refs: t.IRefsOut) => Object.keys(refs).map(key => ({ key, refs: refs[key] })),
  refsToFlatList: (refs: t.IRefsOut) => R.flatten(Object.keys(refs).map(key => refs[key])),
  refsToAllKeys: (refs: t.IRefsOut) => outgoing.listToKeys(outgoing.refsToFlatList(refs)),
};
