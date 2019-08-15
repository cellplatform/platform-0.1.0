import { t } from '../common';
import { json as parse } from 'micro';

/**
 * Parse body as JSON.
 *
 *   limit      (example "1mb", 1024 as bytes)
 *   encoding   (example "utf-8", default)
 *
 */
export async function json<T>(
  req: t.IncomingMessage,
  defaultValue?: T,
  options: { limit?: string | number; encoding?: string } = {},
): Promise<T> {
  try {
    const body = await parse(req, options);
    return (body === undefined ? defaultValue : body) as T;
  } catch (error) {
    return defaultValue as T;
  }
}
