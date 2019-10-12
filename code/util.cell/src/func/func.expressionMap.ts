import { t } from '../common';
import { BinaryExprOperator, FuncName } from '../func.sys/types';

/**
 * Maps binary-expression (eg: "=1+A1") to corresponding function resolvers.
 * Expression:
 *    '>' | '<' | '=' | '>=' | '<=' | '+' | '-' | '&' | '*' | '/'
 */
export const getExprFunc = async (getFunc: t.GetFunc, operator: BinaryExprOperator) => {
  let name: FuncName | undefined;

  if (operator === '+') {
    name = 'SUM';
  }
  if (operator === '-') {
    name = 'SUBTRACT';
  }
  if (operator === '*') {
    name = 'MULTIPLY';
  }
  if (operator === '/') {
    name = 'DIVIDE';
  }

  return name ? getFunc({ name, namespace: 'sys' }) : undefined;
};
