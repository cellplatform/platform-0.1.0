import { t } from '../common';
import * as util from './util';

/**
 * Retrieves the average (arithmetic mean).
 */
export const average: t.FuncInvoker = async args => {
  const params = util.paramsToNumbers(args.params);
  return params.reduce((acc, next) => acc + next, 0) / params.length;
};
