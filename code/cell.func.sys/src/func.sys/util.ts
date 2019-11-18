import { t, value } from '../common';

/**
 * Process input parameters to a set of numbers.
 */
export function paramsToNumbers(input?: t.FuncParam[]) {
  return (input || [])
    .reduce((acc, next) => {
      acc = Array.isArray(next) ? [...acc, ...next] : [...acc, next];
      return acc;
    }, [] as any[])
    .map(p => (typeof p === 'string' ? value.toNumber(p) : p) as number)
    .map(p => (typeof p === 'number' || typeof p === 'bigint' ? p : undefined))
    .filter(p => p !== undefined) as number[];
}
