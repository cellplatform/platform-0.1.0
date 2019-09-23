import { R, sha } from '../common';

export type IHashOptions = {
  asString?: (input?: any) => string;
};

/**
 * Hash any value into a SHA-256.
 */
export function sha256(input: any, options: IHashOptions = {}) {
  const text = (options.asString || R.toString)(input);
  return sha.sha256(text);
}

/**
 * Hash any value into a SHA-224.
 */
export function sha224(input: any, options: IHashOptions = {}) {
  const text = (options.asString || R.toString)(input);
  return sha.sha224(text);
}
