import { parse } from 'url';

import { fs } from './libs';
import { isModel } from './util.model';

export * from './util.model';
export * from './util.logger';

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
