import { t, http, cell } from './common';

type F = t.IFetchOptions;

/**
 * Initializes a CellOS http client.
 */
export function init(args: { host: string; port: number }) {
  // Prepare base URL.
  const protocol = args.host === 'localhost' ? 'http' : 'https';
  const host = `${args.host}:${args.port}`;
  const origin = `${protocol}://${host}`;
  const url = (path: string) => `${origin}/${(path || '').replace(/^\/*/, '')}`;

  // HTTP client.
  const client = {
    origin,
    uri: cell.Uri,
    url,
    get: async (path: string, options: F = {}) => http.get(url(path), options),
    post: async (path: string, data?: any, options: F = {}) => http.post(url(path), data, options),
  };

  // Finish up.
  return client;
}
