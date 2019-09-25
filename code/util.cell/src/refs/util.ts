import { ast } from '../ast';

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
