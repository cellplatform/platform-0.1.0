/**
 * Inlined from original:
 *
 *    https://www.npmjs.com/package/matcher
 *    https://github.com/sindresorhus/matcher
 *
 * Reason for inlining:
 *
 *    The module is published on NPM as ES6 rather than
 *    being transpiled to ES5 which is common.
 *    This was causing `next.js` (version 4.1.4) to fail
 *    with an Uglify error while building for production.
 *
 * Original copyright as at 27 Nov 2017:
 *
 *    The MIT License (MIT)
 *    Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
 *    See:
 *        https://github.com/sindresorhus/matcher/blob/master/license
 *
 */
const cache = new Map();
import { escapeStringRegex } from './escapeStringRegex';

/**
 * Accepts an array of inputs and patterns.
 * Returns an array of of inputs filtered based on the patterns.
 */
export function filter(patterns: string | string[] | undefined | null, inputs: string[]): string[] {
  if (patterns === undefined || patterns === null) {
    return [];
  }
  patterns = Array.isArray(patterns) ? patterns : [patterns];

  if (!(Array.isArray(inputs) && Array.isArray(patterns))) {
    throw new TypeError(`Expected two arrays, got ${typeof inputs} ${typeof patterns}`);
  }

  if (patterns.length === 0) {
    return inputs;
  }

  const firstNegated = patterns[0][0] === '!';
  const regExPatterns = patterns.map((x) => makeRegEx(x, false));
  const result = [];

  for (const input of inputs) {
    // If first pattern is negated we include everything to match user expectation
    let matches = firstNegated;

    for (const pattern of regExPatterns) {
      if (pattern.test(input)) {
        matches = !pattern.negated;
      }
    }

    if (matches) {
      result.push(input);
    }
  }

  return result;
}

/**
 * Returns a boolean of whether the input matches the pattern.
 */
export function isMatch(input: string, pattern: string | undefined | null): boolean {
  return pattern === undefined || pattern === null ? false : makeRegEx(pattern, true).test(input);
}

/**
 * Regular expression matching.
 */
type RegExMatcher = RegExp & { negated: boolean };
function makeRegEx(pattern: string, shouldNegate: boolean): RegExMatcher {
  const cacheKey = pattern + shouldNegate;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const negated = pattern[0] === '!';

  if (negated) {
    pattern = pattern.slice(1);
  }

  pattern = escapeStringRegex(pattern).replace(/\\\*/g, '.*');

  if (negated && shouldNegate) {
    pattern = `(?!${pattern})`;
  }

  const result = new RegExp(`^${pattern}$`, 'i') as RegExMatcher;
  result.negated = negated;
  cache.set(cacheKey, result);

  return result;
}
