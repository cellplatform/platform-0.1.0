type Q = Record<string, string | number>;

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
export function toCtx(token: string, version: number) {
  token = (token ?? '').trim();
  if (!token) throw new Error(`A Vercel authorization token not provided.`);

  const Authorization = `Bearer ${token}`;
  const headers = { Authorization };

  return {
    token,
    version,
    headers,
    Authorization,
    url: (path: string, query?: Q) => toUrl(version, path, query),
  };
}
