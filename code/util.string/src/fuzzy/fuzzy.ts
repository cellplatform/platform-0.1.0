/**
 *
 * See (MIT):
 *    https://github.com/mattyork/fuzzy
 *
 */
import * as fuzzy from 'fuzzy';

export type IFuzzyMatch = {
  value: string;
  score: number;
};

export type IFuzzyFilterMatch = IFuzzyMatch & { index: number };

/**
 * Determines whether there is a match in the input stirng with the given fuzzy pattern.
 */
export function match(pattern: string, input: string): IFuzzyMatch | undefined {
  const res = fuzzy.match(pattern, input);
  return res ? { value: res.rendered, score: res.score } : undefined;
}

/**
 * Performs a boolean check on whether there is a fuzzy pattern match on the given values.
 */
export function isMatch(pattern: string, input: string) {
  return Boolean(match(pattern, input));
}

/**
 * Filters on fuzzy pattern matches over the input strings.
 */
export function filter(pattern: string, inputs: string[]): IFuzzyFilterMatch[] {
  return fuzzy.filter(pattern, inputs).map((item: any) => {
    const value = item.string;
    const score = item.score;
    const index = item.index;
    return { value, score, index };
  });
}
