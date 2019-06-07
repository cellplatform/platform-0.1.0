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
 * Value utilities
 */
export function value(value: t.PropValue) {
  return {
    value,
    get type(): t.PropType {
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
      if (type === 'number' || type === 'bigint') {
        return 'number';
      }
      if (type === 'boolean') {
        return 'boolean';
      }
      if (type === 'function') {
        return 'function';
      }
      if (type === 'string') {
        return 'string';
      }
      throw new Error(`Value type '${typeof value}' not supported.`);
    },
  };
}

/**
 * Convert the given value as a string to it's proper type.
 */
export function toType(input: string, type: t.PropType): t.PropValue {
  if (type === 'undefined' || type === 'null' || type === 'string') {
    return input;
  }
  if (type === 'boolean') {
    return valueUtil.toBool(input);
  }
  if (type === 'number') {
    return valueUtil.toNumber(input);
  }
  throw new Error(`Value type '${typeof value}' not supported.`);
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
