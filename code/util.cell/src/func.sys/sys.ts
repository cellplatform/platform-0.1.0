import { t, value } from '../common';

/**
 * Get system functions.
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
 * Add a series of numbers
 */
const sum: t.FuncInvoker = async args => {
  const params = (args.params || []).map((item, i) => {
    if (typeof item === 'string') {
      item = value.toNumber(item);
    }
    if (!(typeof item === 'number' || typeof item === 'bigint')) {
      return 0; // NB: Add 0 (no change).
      // const err = `SUM: parameter [${i}] of type '${typeof item}' is not valid. Must be a number. ("${item}")`;
      // throw new Error(err);
    }
    return item as number;
  });

  return params.reduce((acc, next) => acc + next, 0);
};
