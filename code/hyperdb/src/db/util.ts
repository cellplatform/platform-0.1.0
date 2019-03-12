import { value as valueUtil } from '../common';
import * as t from './types';

function isNil(value: any) {
  return value === null || value === undefined;
}

export function toValue<K, V>(response: any, options: { parse?: boolean } = {}): t.IDbValue<K, V> {
  // NOTE:  The response value is parsed automatically within the DB's `map` function.
  //        See constructor options.
  //        The only time you may want to parse is if the value came back without
  //        having gone through the `map` - for instance, a `delete` response.
  const exists = response && !isNil(response.value) ? true : false;
  const value = options.parse ? parseValue(response.value) : response.value;
  const props: t.IDbValueProps<K> = { exists, ...response };
  delete response.value;
  return {
    value,
    props,
  };
}

export function parseValue<V>(value: any): V | undefined {
  if (isNil(value)) {
    return undefined;
  }

  value = valueUtil.toType(value);
  if (typeof value === 'boolean' || typeof value === 'number') {
    return value as any;
  }

  try {
    const obj = JSON.parse(value);
    let result = obj.v;
    result = valueUtil.isDateString(result) ? new Date(result) : result;
    return result;
  } catch (error) {
    if (!valueUtil.isJson(value)) {
      return value; // NB: Somehow a value got into the DB that wasn't serialized as JSON.
    }
    throw new Error(`Failed while parsing stored DB value '${value}'. ${error.message}`);
  }
}

export function serializeValue(value: any) {
  if (value === undefined || typeof value === 'boolean' || typeof value === 'number') {
    return value;
  }
  return JSON.stringify({ v: value });
}

export function formatWatchPatterns<T extends object = any>(pattern: Array<keyof T>) {
  const asWildcard = (pattern: string) => (pattern === '' ? '*' : pattern);
  pattern = Array.isArray(pattern) ? pattern : [pattern];
  let patterns = pattern.map(p => p.toString());
  patterns = patterns.length === 0 ? ['*'] : patterns; // NB: Watch for all changes if no specific paths were given.
  patterns = patterns.map(p => p.trim()).map(p => asWildcard(p));
  return patterns;
}
