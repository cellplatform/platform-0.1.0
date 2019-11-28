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
  options: t.BodyJsonOptions<T> = {},
): Promise<T> {
  try {
    const body = await parse(req, options);
    return (body === undefined ? options.default : body) as T;
  } catch (error) {
    return options.default as T;
  }
}
