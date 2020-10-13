import { parse as parseUrl } from 'url';
import { t, fs } from '../../common';

export * from './util.logger';

type M = t.WebpackModel | t.ConfigBuilderChain;

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
  model: (input: any) => typeof (input as any).toObject === 'function',
};

/**
 * Wrangle object types into a [model].
 */
export const toModel = (input: M) => {
  return (is.model(input) ? (input as any).toObject() : input) as t.WebpackModel;
};

/**
 * Format a host URL.
 */
export function parseHostUrl(input: string) {
  input = (input || '').trim();
  const hasProtocol = input.startsWith('http:') || input.startsWith('https:');
  if (!hasProtocol) {
    input = input.startsWith('localhost') ? `http://${input}` : `https://${input}`;
  }

  const parsed = parseUrl(input);
  const protocol = parsed.protocol || '';
  const hostname = parsed.hostname || '';
  const url = `${protocol}//${hostname}`;
  const port = parsed.port ? parseInt(parsed.port, 10) : undefined;

  return {
    url,
    port,
    protocol,
    hostname,
    toString(options: { port?: boolean } = {}) {
      return options.port && parsed.port ? `${url}:${parsed.port}` : url;
    },
  };
}

/**
 * Helpers for working with paths
 */
export const path = {
  base: fs.resolve('.'),
  trimBase(value: string) {
    return value.startsWith(path.base) ? value.substring(path.base.length + 1) : value;
  },
};
