import * as t from './types';
import { value as valueUtil } from './libs';
import { COLORS } from './constants';

/**
 * Builds a <TreeView> node structure.
 */
export function buildTree(args: {
  data?: object | any[];
  parent: t.IPropNode;
  root: t.IPropNode;
  formatNode: (node: t.IPropNode) => t.IPropNode;
}): t.IPropNode {
  const { data, root, formatNode } = args;
  // const util = TreeView.util;
  let parent = args.parent;

  if (Array.isArray(data)) {
    console.log(`\nTODO 🐷   ARRAY \n`);
  }

  if (typeof data === 'object' && !Array.isArray(data)) {
    const children = Object.keys(data).map(key => {
      const id = `${parent.id}.${key}`;
      const value = data[key];
      const isArray = Array.isArray(value);
      const isObject = typeof value === 'object' && !isArray;
      let node: t.IPropNode = formatNode({
        id,
        props: { label: key, borderTop: false, borderBottom: false },
        data: { path: id, key, value },
      });

      if (isObject || isArray) {
        const parent = node;
        const data = value;
        node = buildTree({ data, parent, root, formatNode }); // <== RECURSION
      }

      return node;
    });

    parent = { ...parent, children };
  }

  return parent;
}

/**
 * Get the type of the given value.
 */

export function getType(value: t.PropValue) {
  if (value === null) {
    return 'null';
  }
  if (value === 'undefined') {
    return 'undefined';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  const type = typeof value;
  if (type === 'object') {
    return 'object';
  }
  if (type === 'number' || type === 'bigint' || valueUtil.isNumeric(value)) {
    return 'number';
  }
  if (type === 'boolean' || (typeof value === 'string' && valueUtil.isBoolString(value))) {
    return 'boolean';
  }
  if (type === 'function') {
    return 'function';
  }
  if (type === 'string') {
    return 'string';
  }
  throw new Error(`Value type '${type}' not supported (value: ${value}).`);
}

/**
 * Convert the given value as a string to it's proper type.
 */
export function valueToType(value: string, type: t.PropType): t.PropValue {
  if (type === 'undefined' || type === 'null' || type === 'string') {
    return value;
  }
  if (type === 'boolean') {
    return valueUtil.toBool(value);
  }
  if (type === 'number' && !(value.startsWith('.') || value.endsWith('.'))) {
    return valueUtil.toNumber(value);
  }
  throw new Error(`toType: Value type '${typeof value}' not supported (value: ${value}).`);
}

/**
 * Gets the color for a value type.
 */
export function typeColor(type: t.PropType, theme: t.PropsTheme) {
  if (type === 'number' || type === 'boolean') {
    return COLORS.PURPLE;
  }
  if (type === 'string') {
    return COLORS.DARK_RED;
  }
  return theme === 'DARK' ? COLORS.WHITE : COLORS.WHITE;
}
