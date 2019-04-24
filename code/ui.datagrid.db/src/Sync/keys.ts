import { cell as util } from '@platform/util.value.cell';
import { constants } from '../common';

const { KEY } = constants;

export function toDbCellKey(key: string | { key: string }) {
  return toDbKey(KEY.PREFIX.CELL, key);
}
export function toDbColumnKey(key: number | string) {
  key = typeof key === 'number' ? util.toKey(key) : key;
  return toDbKey(KEY.PREFIX.COLUMN, key);
}
export function toDbRowKey(key: number | string) {
  return toDbKey(KEY.PREFIX.ROW, key);
}

export function toGridCellKey(key: string) {
  return lastPart(key, '/').toUpperCase();
}
export function toGridColumnKey(key: string) {
  return lastPart(key, '/').toUpperCase();
}
export function toGridRowKey(key: string) {
  return lastPart(key, '/').toUpperCase();
}

/**
 * [Helpers]
 */
function lastPart(text: string, delimiter: string) {
  const parts = (text || '').split(delimiter);
  return parts[parts.length - 1];
}

function toDbKey(prefix: string, key: string | number | { key: string }) {
  key = typeof key === 'number' ? key.toString() : key;
  key = typeof key === 'object' ? key.key : (key || '').toString();
  key = lastPart(key, '/');
  return !key ? '' : `${prefix}${key}`;
}
