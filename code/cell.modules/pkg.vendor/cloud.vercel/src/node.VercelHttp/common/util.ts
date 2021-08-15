import { createHash } from 'crypto';
import { DEFAULT } from './libs';
import * as t from './types';

type Q = Record<string, string | number | undefined>;

/**
 * Format a URL.
 */
export function toUrl(version: number, path: string, query?: Q) {
  path = (path ?? '').trim().replace(/^\/*/, '').split('?')[0];

  const keys = query ? Object.keys(query) : [];
  const querystring =
    keys.length === 0
      ? ''
      : keys
          .map((key) => ({ key, value: query?.[key] ?? '' }))
          .filter(({ value }) => Boolean(value))
          .map(({ key, value }) => `${key}=${value}`)
          .join('&');

  const url = `https://api.vercel.com/v${version}/${path}`;
  return querystring ? `${url}?${querystring}` : url;
}

/**
 * Ensure the URL is prefixed with HTTPS
 */
export function ensureHttps(url: string) {
  url = (url || '').trim();
  if (!url) return '';
  url = url.replace(/^https\:\/\//, '').replace(/^http\:\/\//, '');
  return `https://${url}`;
}

/**
 * Creates a common context object.
 */
export function toCtx(fs: t.IPosixFs, http: t.Http, token: string, version?: number) {
  token = (token ?? '').trim();
  if (!token) throw new Error(`A Vercel authorization token not provided.`);

  const Authorization = `Bearer ${token}`;
  const headers = { Authorization };

  const ctx: t.Ctx = {
    version: version ?? DEFAULT.version,
    token,
    headers,
    Authorization,
    http,
    fs,
    url(path, query, options = {}) {
      return toUrl(options.version ?? ctx.version, path, query);
    },
  };

  return ctx;
}

/**
 * Generates a SHA1 digest hash.
 */
export function shasum(data: Buffer) {
  return createHash('sha1').update(data).digest('hex');
}
