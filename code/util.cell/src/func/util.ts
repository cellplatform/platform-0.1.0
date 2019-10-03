export { path } from '../refs/util';

/**
 * Determine if the given cell value represents a formula.
 */
export function isFormula(input?: any) {
  return (typeof input === 'string' ? input : '')[0] === '=';
}
