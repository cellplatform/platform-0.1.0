import { t } from '../../common';

const toString = (input?: string) => (input || '').trim();

export function format(namespace?: string, id?: string) {
  return `${toString(namespace)}:${toString(id)}`;
}

export function parse(input?: string) {
  input = toString(input);
  if (hasNamespace(input)) {
    const id = stripNamespace(input);
    const namespace = input.substring(0, input.length - id.length - 1);
    return { namespace, id };
  } else {
    return { namespace: '', id: input };
  }
}

export function hasNamespace(input?: string) {
  input = toString(input);
  return !input.startsWith(':') && input.includes(':');
}

export function stripNamespace(input?: string) {
  input = toString(input).replace(/^\:/, '');
  if (hasNamespace(input)) {
    const index = input.indexOf(':');
    return index > -1 ? input.substring(index + 1) : input;
  } else {
    return input;
  }
}

export function namespace(input?: string) {
  return parse(input).namespace;
}

export function id(input?: string) {
  return stripNamespace(input);
}

export const NodeIdentity: t.NodeIdentity = {
  toString,
  format,
  parse,
  stripNamespace,
  hasNamespace,
  namespace,
  id,
};
