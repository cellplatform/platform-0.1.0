import { t, toNodeId } from '../common';
import { id } from '@platform/util.value';

const toString = (input?: string) => (input || '').trim();

export function format(namespace?: string, key?: string) {
  return `${toString(namespace)}:${toString(key)}`;
}

export function parse(input?: string) {
  input = toString(input);
  if (hasNamespace(input)) {
    const key = stripNamespace(input);
    const namespace = input.substring(0, input.length - key.length - 1);
    const id = `${namespace}:${key}`;
    return { namespace, key, id };
  } else {
    return { namespace: '', key: input, id: input };
  }
}

export function hasNamespace(input?: string) {
  input = toString(input);
  return !input.startsWith(':') && input.includes(':');
}

export function stripNamespace(input?: string) {
  input = toString(input).replace(/^:/, '');
  if (hasNamespace(input)) {
    const index = input.lastIndexOf(':');
    return index > -1 ? input.substring(index + 1) : input;
  } else {
    return input;
  }
}

export function namespace(input?: string) {
  return parse(input).namespace;
}

export function key(input?: string) {
  return stripNamespace(input);
}

export const TreeIdentity: t.TreeIdentity = {
  toNodeId,
  toString,
  format,
  parse,
  stripNamespace,
  hasNamespace,
  namespace,
  key,
  cuid: () => id.cuid(),
  slug: () => id.shortid(),
};
