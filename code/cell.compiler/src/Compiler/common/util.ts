import { parse } from 'url';

import { fs } from '../../common';
import { isModel } from './util.model';

export * from './util.logger';
export * from './util.model';

/**
 * Escape reserved characters from a path.
 */
export const escapeKeyPath = (key: string) => key.replace(/\//g, '\\');
export const escapeKeyPaths = (obj: Record<string, any>) => {
  return Object.keys(obj).reduce((acc, key) => {
    acc[escapeKeyPath(key)] = obj[key];
    return acc;
  }, {});
};

/**
 * Remove escaping from a path.
 */
export const unescapeKeyPath = (key: string) => key.replace(/\\/g, '/');
export const unescapeKeyPaths = (obj: Record<string, any>) => {
  return Object.keys(obj).reduce((acc, key) => {
    acc[unescapeKeyPath(key)] = obj[key];
    return acc;
  }, {});
};

/**
 * Flag tests.
 */
export const is = {
  model: (input: any) => isModel(input),
};

export function parseUrl(input: string) {
  input = (input || '').trim();

  const hasProtocol = input.startsWith('http:') || input.startsWith('https:');
  if (!hasProtocol) {
    input = input.startsWith('localhost') ? `http://${input}` : `https://${input}`;
  }

  const parsed = parse(input);
  const protocol = parsed.protocol || '';
  const hostname = parsed.hostname || '';
  const path = parsed.pathname ? parsed.pathname.replace(/^\/*/, '') : '';
  const port = parsed.port ? parseInt(parsed.port, 10) : undefined;

  let url = `${protocol}//${hostname}`;
  url = port && port !== 80 ? `${url}:${port}` : url;
  url = path ? `${url}/${path}` : url;
  url = `${url.replace(/\/*$/, '')}/`;

  return {
    url,
    port,
    protocol,
    host: parsed.host || '',
    hostname,
    path,
    toString: () => url,
  };
}

/**
 * Helpers for working with paths
 */
export const path = {
  base: fs.resolve('.'),
  trimBase(value: string) {
    value = (value || '').trim();
    return value.startsWith(path.base) ? value.substring(path.base.length + 1) : value;
  },
  trimBaseDir(value: string) {
    value = path.trimBase(value);
    return `${value.replace(/\/*$/, '')}/`;
  },
};
