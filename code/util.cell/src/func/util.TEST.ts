import { expect } from 'chai';
import { func } from '.';
import { t, value } from '../common';
import { sys } from '../func.sys';
import { refs } from '../refs';

/**
 * Utility tests.
 */
describe('func', () => {
  it('isFormula', () => {
    const test = (value: any, expected: boolean) => {
      expect(func.isFormula(value)).to.eql(expected);
    };
    test(undefined, false);
    test('', false);
    test(' =', false);
    test({}, false);
    test(123, false);

    test('=', true);
    test('=SUM(1,2,3)', true);
  });
});
