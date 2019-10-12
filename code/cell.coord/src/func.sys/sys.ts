import { t, value } from '../common';

/**
 * Get system functions.
 * Binay expressions:
 *    '>' | '<' | '=' | '>=' | '<=' | '+' | '-' | '&'
 */
export const getFunc: t.GetFunc = async args => {
  const { namespace, name } = args;
  if (namespace === 'sys') {
    switch (name) {
      case 'SUM':
        return sum;
      case 'AVG':
      case 'AVERAGE':
        return average;
    }
  }
  return undefined;
};

/**
 * Add a series of numbers.
 */
const sum: t.FuncInvoker = async args => {
  const params = paramsToNumbers(args.params);
  return params.reduce((acc, next) => acc + next, 0);
};

/**
 * Retrieves the average (arithmetic mean).
 */
const average: t.FuncInvoker = async args => {
  const params = paramsToNumbers(args.params);
  return params.reduce((acc, next) => acc + next, 0) / params.length;
};

/**
 * [Helpers]
 */

function paramsToNumbers(input?: t.FuncParam[]) {
  return (input || [])
    .reduce(
      (acc, next) => {
        acc = Array.isArray(next) ? [...acc, ...next] : [...acc, next];
        return acc;
      },
      [] as any[],
    )
    .map(p => (typeof p === 'string' ? value.toNumber(p) : p) as number)
    .map(p => (typeof p === 'number' || typeof p === 'bigint' ? p : undefined))
    .filter(p => p !== undefined) as number[];
}
