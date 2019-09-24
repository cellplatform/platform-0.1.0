import { expect } from 'chai';
import { formula } from '.';

describe('util.formula', () => {
  it('isFormula', () => {
    const test = (value: any, expected: boolean) => {
      expect(formula.isFormula(value)).to.eql(expected);
    };
    test(undefined, false);
    test('', false);
    test(' =', false);

    test('=', true);
    test('=SUM(1,2,3)', true);
  });
});
