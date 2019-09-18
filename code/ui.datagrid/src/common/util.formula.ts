import * as t from './types';

/**
 * Determine if the given cell value represents a formula.
 */
export function isFormula(input?: t.IGridCell) {
  const value = input ? input.value : undefined;
  return (typeof value === 'string' ? value : '')[0] === '=';
}
