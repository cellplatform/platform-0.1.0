import { value as valueUtil, t } from '../common';

export function isObject(value: any) {
  return value !== null && typeof value === 'object';
}

export function isNil(value: any) {
  return value === undefined || value === null;
}

export function toValue<K, V>(response: any, options: { parse?: boolean } = {}): t.IDbValue<K, V> {
  const isObj = isObject(response);
  const exists = isObj && !isNil(response.value) ? true : false;

  // NOTE:  The response value is parsed automatically within the DB's `map` function.
  //        See constructor options.
  //        The only time you may want to parse is if the value came back without
  //        having gone through the `map` - for example, a `delete` response.
  let value = isObj ? response.value : undefined;
  value = options.parse ? parseValue(value) : value;

  const props: any = { exists, ...toNodeProps(response) };
  return {
    value,
    props,
  };
}
function toNodeProps(response?: t.IDbNode) {
  if (!response) {
    return {};
  } else {
    const { key, deleted, clock, feed, seq, path, inflate, trie } = response;
    return { key, deleted, clock, feed, seq, path, inflate, trie };
  }
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
    result = result === null ? undefined : result;
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
