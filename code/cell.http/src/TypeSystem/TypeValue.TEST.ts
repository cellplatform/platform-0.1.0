import { expect } from './test';
import { TypeValue } from './TypeValue';

describe.skip('TypeValue', () => {
  it('isRef', () => {
    const test = (input: any, expected: boolean) => {
      expect(TypeValue.isRef(input)).to.eql(expected);
    };

    test(undefined, false);
    test({}, false);
    test('', false);
    test('  ', false);
    test('string', false);
    test('  boolean  ', false);

    test('ns:foo', true);
    test('  ns:foo  ', true);
  });

  it('isArray: eg. "string[]" or "(string | ns:foo)[]"', () => {
    const test = (input: any, expected: boolean) => {
      const res = TypeValue.isArray(input);
      if (!res === expected) {
        throw new Error('Fail');
      }
    };
    test(undefined, false);
    test({}, false);
    test('', false);
    test('  ', false);
    test('string', false);
    test('  boolean  ', false);
    test('Array<number>', false); // Never valid.

    test('string []', false); // Space before "[]".
    test('string[ ]', false); // Space within "[ ]".

    test('string[]', true);
    test('  boolean[]  ', true); // Space trimmed.
    test('ns:foo[]', true);

    test('(string | number)[]', true);
    test('(string|boolean)[]', true); // No spaces (correct, but not great formatting).
    test('(string[] | number)[]', true);
    test('(string | ns:foo)[]', true);
    test('(string | (boolean | number)[])[]', true);
    test('(string | ("red" | "green"))[]', true);
    test('(string | ("red" | "green")[] | number)[]', true);
    test('(string | ns:foo[] | ns:bar)[]', true);

    // Invalid: empty.
    test('()[]', false);
    test('(  )[]', false);
  });

  describe('parse', () => {
    it('UNKNOWN', () => {
      const test = (input: any) => {
        const res = TypeValue.parse(input);
        expect(res.kind).to.eql('UNKNOWN');
        expect(res.typename).to.eql(typeof input === 'string' ? input.trim() : '');
      };
      test(undefined);
      test(null);
      test({});
      test(123);
      test(true);
      test('');
      test('  ');
      test('one | two'); // NB: not quoted

      // Case-sensitive.
      test('STRING');
      test('BOOLEAN');
      test('NUMBER');
      test('NULL');
      test('UNDEFINED');

      test('String');
      test('Boolean');
      test('Number');
      test('Null');
      test('Undefined');

      test('string[][]'); // NB: Multi-dimensional arrays not supported.
    });

    it('VALUE', () => {
      const test = (input: string) => {
        const res = TypeValue.parse(input);
        expect(res.kind).to.eql('VALUE');
        expect(res.typename).to.eql(input.trim());
        if (res.kind === 'VALUE') {
          // expect(res.isArray).to.eql(isArray);
        }
      };

      test('string');
      test('boolean');
      test('number');
      test('null');
      test('undefined');

      // test('string[]', true);
      // test('boolean[]', true);
      // test('number[]', true);
      // test('null[]', true);
      // test('undefined[]', true);

      // Trims spaces.
      test('  string   ');
      // test('  string[]   ', true);
    });

    it('REF', () => {
      const test = (input: string) => {
        const res = TypeValue.parse(input);
        expect(res.kind).to.eql('REF');
        if (res.kind === 'REF') {
          expect(res.uri).to.eql(input.trim());
          expect(res.typename).to.eql(''); // NB: Stub REF object, requires lookup against network.
          expect(res.types).to.eql([]);
        }
      };

      test('ns:foo');
      test('  ns:foo  ');
    });

    it('ENUM', () => {
      const test = (input: string, values: (string | number)[]) => {
        const res = TypeValue.parse(input);
        expect(res.kind).to.eql('ENUM');
        if (res.kind === 'ENUM') {
          const typename = res.values.map(part => `'${part}'`).join(' | ');
          expect(res.typename).to.eql(typename);
          expect(res.values).to.eql(values);
        }
      };
      test(`"one"`, ['one']);
      test(`' one '`, ['one']);
      test(`'one'|'  two  '`, ['one', 'two']);
      test(`"one" | 'two' | " three four "`, ['one', 'two', 'three four']);
    });

    it.skip('UNION', () => {}); // tslint:disable-line
    it.skip('', () => {}); // tslint:disable-line
  });
});
