import { t } from '../../common';

const toString = (input?: string) => (input || '').trim();
const REGEX = {
  prefix: /^tree-[a-zA-Z0-9]+:/,
};

export function format(namespace?: string, id?: string) {
  return `tree-${toString(namespace)}:${toString(id)}`;
}

export function parse(input?: string) {
  input = toString(input);
  if (hasNamespace(input)) {
    const id = stripNamespace(input);
    const namespace = input.substring(0, input.length - id.length - 1).replace(/^tree-/, '');
    return { namespace, id };
  } else {
    return { namespace: '', id: input };
  }
}

export function hasNamespace(input?: string) {
  return Boolean(toString(input).match(REGEX.prefix));
}

export function stripNamespace(input?: string) {
  return toString(input).replace(REGEX.prefix, '');
}

export function namespace(input?: string) {
  return parse(input).namespace;
}

export const id: t.TreeStateId = {
  toString,
  format,
  parse,
  stripNamespace,
  hasNamespace,
  namespace,
};
