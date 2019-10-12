import { t, value } from '../common';
import * as arithmetic from './sys.arithmetic';
import * as stats from './sys.stats';
import { FuncName } from './types';

export { arithmetic, stats };
export * from './types';

/**
 * Get system functions.
 * Binay expressions:
 *    '>' | '<' | '=' | '>=' | '<=' | '+' | '*' | '-' | '&'
 */
export const getFunc: t.GetFunc = async args => {
  const { namespace, name } = args;
  if (namespace === 'sys') {
    switch (name as FuncName) {
      /**
       * Arithmetic.
       */
      case 'SUM':
        return arithmetic.sum;
      case 'SUBTRACT':
        return arithmetic.subtract;
      case 'MULTIPLY':
        return arithmetic.multiply;
      case 'DIVIDE':
        return arithmetic.divide;

      /**
       * Statistics.
       */
      case 'AVG':
      case 'AVERAGE':
        return stats.average;
    }
  }

  // Not found.
  return undefined;
};
