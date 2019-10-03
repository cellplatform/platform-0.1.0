import { t, value } from '../common';

/**
 * Get system functions.
 * Expressions:
 *    '>' | '<' | '=' | '>=' | '<=' | '+' | '-' | '&'
 */
export const getFunc: t.GetFunc = async args => {
  const { namespace, name } = args;
  if (namespace === 'sys') {
    switch (name) {
      case 'SUM':
        return sum;
    }
  }
  return undefined;
};

/**
 * Add a series of numbers.
 */
const sum: t.FuncInvoker = async args => {
  const params = (args.params || [])
    .reduce(
      (acc, next) => {
        acc = Array.isArray(next) ? [...acc, ...next] : [...acc, next];
        return acc;
      },
      [] as any[],
    )
    .map(param => (typeof param === 'string' ? value.toNumber(param) : param) as number)
    .map(param => (typeof param === 'number' || typeof param === 'bigint' ? param : 0)); // NB: Add 0 (no change)

  return params.reduce((acc, next) => acc + next, 0);
};
