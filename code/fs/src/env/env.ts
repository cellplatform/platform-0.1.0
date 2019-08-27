import * as dotenv from 'dotenv';
import { resolve, join } from 'path';
import { ancestor } from '../ancestor';

export type IEnvLoadArgs = {
  debug?: boolean;
  ancestor?: boolean | number;
  dir?: string;
  file?: string;
};

/**
 * Loads the [.env] file into [process.env] with the
 * ability to walk up the file-hierarchy looking for
 * the first file match.
 */
export async function load(args: IEnvLoadArgs = {}) {
  const { debug, file = '.env' } = args;
  const dir = args.dir === undefined ? resolve('.') : resolve(args.dir);
  let path: string | undefined;

  // Build the file path to load.
  if (args.ancestor === true || typeof args.ancestor === 'number') {
    const max = typeof args.ancestor === 'number' ? args.ancestor : undefined;
    path = ancestor(dir).firstSync(file, { type: 'FILE', max });
    path = path ? path : undefined;
  } else {
    path = join(dir, file);
  }

  const res = dotenv.config({ path, debug });
  const { parsed, error } = res;
  const ok = !Boolean(error);
  return { ok, path, parsed, error };
}

/**
 * Strongly typed way of retrieving environment variables.
 */
export function value<T extends string | number | boolean>(
  key: string,
  options: { throw?: boolean } = {},
): T {
  const done = (value: any) => {
    if (options.throw && !Boolean(value)) {
      throw new Error(`The process.env["${key}"] variable does not exist.`);
    }
    return value as T;
  };

  const res = process.env[key as string];
  if (!res) {
    return done(undefined);
  }

  const upper = res.toUpperCase();
  if (upper === 'TRUE') {
    return done(true);
  }
  if (upper === 'FALSE') {
    return done(false);
  }

  const num = parseFloat(res);
  if (num !== undefined && num.toString().length === res.length && !Number.isNaN(num)) {
    return done(num);
  }

  return done(res);
}
