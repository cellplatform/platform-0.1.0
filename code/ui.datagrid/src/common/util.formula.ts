import * as t from './types';

export function isFormula(input: t.CellValue) {
  const text = typeof input === 'string' ? input : '';

  return text[0] === '=';
}
