import { t } from '../common';
import * as util from './util';

/**
 * Add a series of numbers.
 */
export const sum: t.FuncInvoker = async args => {
  const params = util.paramsToNumbers(args.params);
  return params.length === 0
    ? 0
    : params.reduce((acc, next, i) => (i === 0 ? next : acc + next), 0);
};

/**
 * Subtract a series of numbers.
 */
export const subtract: t.FuncInvoker = async args => {
  const params = util.paramsToNumbers(args.params);
  return params.length === 0
    ? undefined
    : params.reduce((acc, next, i) => (i === 0 ? next : acc - next), 0);
};

/**
 * Multiply a series of numbers.
 */
export const multiply: t.FuncInvoker = async args => {
  const params = util.paramsToNumbers(args.params);
  return params.length === 0
    ? undefined
    : params.reduce((acc, next, i) => (i === 0 ? next : acc * next), 0);
};

/**
 * Divide a series of numbers.
 */
export const divide: t.FuncInvoker = async args => {
  const params = util.paramsToNumbers(args.params);
  return params.length === 0
    ? undefined
    : params.reduce((acc, next, i) => {
        if (next === 0) {
          throw new Error(`Cannot divide by zero.`);
        }
        return i === 0 ? next : acc / next;
      }, 0);
};
