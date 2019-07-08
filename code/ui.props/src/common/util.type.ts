import * as t from './types';
import { value as valueUtil, defaultValue } from './libs';
import { COLORS } from './constants';

/**
 * Get the type of the given value.
 */
export function toType(value: t.PropValue): t.PropType {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
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

/**
 * Converts to an editable type.
 */
export function toEditableTypes(input?: boolean | t.PropDataObjectType | t.PropDataObjectType[]) {
  const types = defaultValue(input, []);
  const res = types === true ? ['object', 'array'] : Array.isArray(types) ? types : [];
  return res as t.PropDataObjectType[];
}
