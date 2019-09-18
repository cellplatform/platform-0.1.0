import { expect } from 'chai';
import { t, formula } from '.';

describe('util.formula', () => {
  it('isFormula', () => {
    const test = (input: t.CellValue, expected: boolean) => {
      expect(formula.isFormula(input)).to.eql(expected);
    };
    test(undefined, false);
    test('', false);
    test(' =', false);

    test('=', true);
    test('=SUM(1,2,3)', true);
  });
});
