import { t } from '../common';
import { buffer as parse } from 'micro';

type R = string | Buffer;

/**
 * Parse body as a file buffer
 *
 *   limit      (example "1mb", 1024 as bytes)
 *   encoding   (example "utf-8", default)
 *
 */
export async function buffer(
  req: t.IncomingMessage,
  options: t.IParseBodyBufferOptions = {},
): Promise<R> {
  try {
    const body = await parse(req, options);
    return (body === undefined ? options.default : body) as R;
  } catch (error) {
    return options.default as R;
  }
}
