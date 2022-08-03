import { t } from '../common';
import { parse } from './ManifestUrl.parse';

/**
 * Modifies a manifest URL.
 */
export function params(url: t.ManifestUrlParts, options: { entry?: string }) {
  const trim = (input: string) => (input || '').trim();
  const params = { ...url.params, ...options };
  params.entry = trim(params.entry);

  // Assembly URL.
  let next = `${url.protocol}://${url.domain}/${url.path}?`;

  // Append query-strings.
  const withQuery = (key: string, value: string) => `${next}entry=${params[key]}&`;
  Object.keys(params).forEach((key) => (next = withQuery(key, params[key])));

  // Finish up.
  next = next.replace(/\?$/, '').replace(/&$/, '');
  return parse(next);
}
