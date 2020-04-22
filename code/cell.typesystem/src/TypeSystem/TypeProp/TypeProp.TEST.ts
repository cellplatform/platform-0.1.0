import { expect, t } from '../../test';
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
      expect(res.error?.message).to.include(includes);
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

    it('throw: too many periods', () => {
      const error = 'is too deep (ie. too many periods)';
      test('MyType.foo.bar', error);
      test(' MyType.foo.bar ', error);
    });

    it('throw: invalid typename', async () => {
      const error = 'contains an invalid typename';
      test('F oo.bar', error);
      test('1Foo.bar', error);
      test(' 1Foo.bar', error);
      test('1.bar', error);
      test('F*oo.bar', error);
    });

    it('throw: invalid prop-name', async () => {
      const error = 'contains an invalid name';
      test('Foo.1bar', error);
      test('Foo.ba r', error);
      test('Foo.1', error);
      test('Foo.bar&zoo', error);
    });
  });
});
