import * as t from './types';

type TransformKey = (key: string) => string;

/**
 * Converts a map to a list.
 */
export function toList(map: t.Map, transformKey?: TransformKey): t.List {
  return Object.keys(map).map(key => {
    const value = map[key];
    key = transformKey ? transformKey(key) : key;
    return { key, value };
  });
}

/**
 * Converts a list to a map.
 */
export function toMap(list: t.List, transformKey?: TransformKey): t.Map {
  return list.reduce((acc, next) => {
    const key = transformKey ? transformKey(next.key) : next.key;
    return { ...acc, [key]: next.value };
  }, {});
}
