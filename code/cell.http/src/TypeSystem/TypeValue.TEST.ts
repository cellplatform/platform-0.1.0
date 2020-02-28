import { expect } from './test';
import { TypeValue } from './TypeValue';

describe.only('TypeValue', () => {
  it('isRef', () => {
    const test = (input: any, expected: boolean) => {
      expect(TypeValue.isRef(input)).to.eql(expected);
    };

    test(undefined, false);
    test({}, false);
    test('', false);
    test('string', false);
    test('  boolean  ', false);

    test('=ns:foo', true);
    test('  =ns:foo  ', true);
    test(' =  ns:foo', true);
  });
});
