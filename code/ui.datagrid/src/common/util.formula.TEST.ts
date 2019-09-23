import { expect } from 'chai';
import { t, formula } from '.';

describe('util.formula', () => {
  it('isFormula', () => {
    const test = (value: t.CellValue, expected: boolean) => {
      const cell = { value };
      expect(formula.isFormula(cell)).to.eql(expected);
    };
    test(undefined, false);
    test('', false);
    test(' =', false);

    test('=', true);
    test('=SUM(1,2,3)', true);
  });
});
