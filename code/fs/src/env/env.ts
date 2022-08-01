import * as dotenv from 'dotenv';
import { resolve, join } from 'path';
import { ancestor } from '../ancestor';

/**
 * TODO
 * - NOW - no run
 * - test on ancestor (number)
 * - values<T>(): {...}
 */

export type IEnvLoadArgs = {
  debug?: boolean;
  ancestor?: boolean | number;
  dir?: string;
  file?: string;
};

export type IEnvVariables = { [key: string]: string | number | boolean };

let IS_LOADED: { [key: string]: boolean } = {};

/**
 * Resets the `load` cache.
 */
export function reset(): void {
  IS_LOADED = {};
}

/**
 * Loads the [.env] file into [process.env] with the
 * ability to walk up the file-hierarchy looking for
 * the first file match.
 */
export async function load(options: IEnvLoadArgs = {}): Promise<void> {
  const { debug, file = '.env' } = options;

  // Exit if running on `zeit/now`.
  // NB: [.env] files should not be used on zeit, rather `now secrets` should be used.
  //     Skipping this step now avoid a synchronous file-system call.
  if (isZeitNow()) {
    return;
  }

  // Retrieve path.
  const dir = options.dir === undefined ? resolve('.') : resolve(options.dir);
  let path: string | undefined;

  // Check if these args have already been run.
  const key = `${dir}:${options.file || ''}:${options.ancestor || false}`;
  if (IS_LOADED[key]) {
    return;
  }

  // Build the file path to load.
  if (options.ancestor === true || typeof options.ancestor === 'number') {
    const max = typeof options.ancestor === 'number' ? options.ancestor : undefined;
    path = ancestor(dir).firstSync(file, { type: 'FILE', max });
    path = path ? path : undefined;
  } else {
    path = join(dir, file);
  }

  // Load.
  dotenv.config({ path, debug });
  IS_LOADED[key] = true;
}

/**
 * Strongly typed method of retrieving a single environment variables.
 */
export function value<T extends string | number | boolean = string>(
  key: string,
  options: { throw?: boolean } = {},
): T {
  const done = (value: any) => {
    if (options.throw && !value) {
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

/**
 * Loads and reads strongly configuration values.
 */
export function values<T extends IEnvVariables>(keys: (keyof T)[], options: IEnvLoadArgs = {}) {
  load(options);
  return keys.reduce((acc, next) => {
    const key = next as string;
    acc[key] = value(key);
    return acc;
  }, {}) as T;
}

/**
 * [Helpers]
 */

const isZeitNow = () => {
  const region = value('NOW_REGION');
  return typeof region === 'string' && region.length > 0 && !region.startsWith('dev');
};
