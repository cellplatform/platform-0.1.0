import { expect, t, ERROR } from '../../test';
import { TypeProp } from '.';

describe('TypeProp', () => {
  it('extracts {type, prop}', async () => {
    const test = (input: any, type: string, prop: string) => {
      const res = TypeProp.parse(input);
      expect(res.error).to.eql(undefined);
      expect(res.type).to.eql(type);
      expect(res.prop).to.eql(prop);
    };

    test('Foo.bar', 'Foo', 'bar');
    test('Foo1.bar', 'Foo1', 'bar');
    test('Foo.bar1', 'Foo', 'bar1');
    test('  Foo.bar  ', 'Foo', 'bar');
    test({ prop: 'Foo.bar' }, 'Foo', 'bar');
  });

  describe('errors', () => {
    const test = (input: string, includes: string) => {
      const res = TypeProp.parse(input);
      expect(res.error).to.not.eql(undefined);
      if (res.error) {
        expect(res.error.message).to.include(includes);
        expect(res.error.type).to.eql(ERROR.TYPE.DEF_INVALID);
      }
    };

    it('throw: no value', () => {
      const error = `Value of 'prop' not provided for type`;
      test('', error);
      test('  ', error);
    });

    it('throw: no typename', () => {
      const error = 'does not contain a typename';
      test('.MyType', error);
      test(' .MyType ', error);
      test(' . MyType ', error);
      test('. MyType ', error);
    });

    it('throw: no property name', () => {
      const error = 'does not contain a name';
      test('MyType', error);
      test('MyType.', error);
      test(' MyType ', error);
      test('  MyType.', error);
      test('  MyType . ', error);
    });

    it('throw: invalid typename', async () => {
      const error = 'Must be alpha-numeric and start with a capital-letter';
      test('F oo.bar', error);
      test('1Foo.bar', error);
      test(' 1Foo.bar', error);
      test('1.bar', error);
      test('F*oo.bar', error);
    });

    it('throw: invalid property-name', async () => {
      const error = 'Must be alpha-numeric and not start with a number';
      test('Foo.1bar', error);
      test('Foo.ba r', error);
      test('Foo.1', error);
      test('Foo.bar&zoo', error);
      test('Foo.bar.zoo', error);
    });
  });
});
