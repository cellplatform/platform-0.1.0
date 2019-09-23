import * as t from './types';

/**
 * Determine if the given cell value represents a formula.
 */
export function isFormula(input?: t.CellValue) {
  return (typeof input === 'string' ? input : '')[0] === '=';
}
