import { expect, t } from '../test';
import { TypeValue } from '.';

describe('TypeValue', () => {
  describe('is (flags)', () => {
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
      test('Array<number>', false); // Never valid - syntax not supported.

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

    it('isGroup', () => {
      const test = (input: any, expected: boolean) => {
        expect(TypeValue.isGroup(input)).to.eql(expected);
      };

      test(undefined, false);
      test({}, false);
      test('', false);
      test('  ', false);
      test('string', false);
      test('  boolean  ', false);

      test('(string)', true);
      test('  (string | boolean)  ', true);
      test('(ns:foo | boolean)[] ', true);

      test('()', true);
      test('(  )', true);
      test('()[]', true);
      test('(  )[]', true);
    });
  });

  describe('toType', () => {
    it('empty (UNKNOWN)', () => {
      const test = (input?: any) => {
        const res = TypeValue.toType(input);
        expect(res.kind).to.eql('UNKNOWN');
        expect(res.typename).to.eql('');
      };
      test('');
      test('  ');
      test();
      test(null);
      test({});
    });

    describe('VALUE', () => {
      const test = (input: string) => {
        const res = TypeValue.toType(`  ${input}  `);
        expect(res.kind).to.eql('VALUE');
        expect(res.typename).to.eql((input || '').trim());
      };

      it('string', () => {
        test('string');
        test('string[]');
      });

      it('boolean', () => {
        test('boolean');
        test('boolean[]');
      });

      it('number', () => {
        test('number');
        test('number[]');
      });

      it('null', () => {
        test('null');
        test('null[]');
      });
    });

    it('ENUM', () => {
      const test = (input: any, typename: string, values: string[]) => {
        const res = TypeValue.toType(input);
        expect(res.kind).to.eql('ENUM');
        if (res.kind === 'ENUM') {
          expect(res.typename).to.eql(typename);
          expect(res.values).to.eql(values);
        }
      };
      test(`'red'`, `'red'`, ['red']);
      test(`'red'|"blue"`, `'red' | 'blue'`, ['red', 'blue']);
    });

    describe('REF', () => {
      it('kind: UNKNOWN (not an NS or COLUMN)', () => {
        const res = TypeValue.toType('cell:foo!A1');
        expect(res.kind).to.eql('UNKNOWN');
        expect(res.typename).to.eql('cell:foo!A1');
      });

      const test = (input: string, scope: t.ITypeRef['scope']) => {
        const res = TypeValue.toType(input);
        expect(res.kind).to.eql('REF');
        if (res.kind === 'REF') {
          expect(res.uri).to.eql(input);
          expect(res.scope).to.eql(scope);
          expect(res.typename).to.eql(''); // NB: Populated elsewhere.
          expect(res.types).to.eql([]); //    NB: Populated elsewhere.
        }
      };
      it('scope: NS', () => {
        test('ns:foo', 'NS');
      });
      it('scope: COLUMN', () => {
        test('cell:foo!A', 'COLUMN');
      });
    });
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

      // Case-sensitive (so unknown).
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
      const test = (input: string, expected?: string) => {
        expected = typeof expected === 'string' ? expected : input.trim();
        const res = TypeValue.parse(input);
        expect(res.kind).to.eql('VALUE');
        expect(res.typename).to.eql(expected);
      };

      test('string');
      test('boolean');
      test('number');
      test('null');
      test('undefined');

      test('  string   '); // Trims spaces.

      test('string[]');
      test('boolean[]');
      test('number[]');
      test('null[]');
      test('undefined[]');
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

    describe('ENUM', () => {
      it('collapses to single ENUM', () => {
        const test = (input: string, enumValues: (string | number)[]) => {
          const res = TypeValue.parse(input);
          expect(res.kind).to.eql('ENUM');
          if (res.kind === 'ENUM') {
            const typename = res.values.map(part => `'${part}'`).join(' | ');
            expect(res.typename).to.eql(typename);
            expect(res.values).to.eql(enumValues);
          }
        };
        test(`"one"`, ['one']);
        test(`' one '`, ['one']);
        test(`'one'|'  two  '`, ['one', 'two']);
        test(`"one" | 'two' | " three four "`, ['one', 'two', 'three four']);
      });

      it('ENUM alongside other types (UNION)', () => {
        const test = (input: string, kinds: string[], enumValues: (string | number)[]) => {
          const res = TypeValue.parse(input);

          expect(res.kind).to.eql('UNION');
          if (res.kind === 'UNION') {
            expect(res.types.map(type => type.kind)).to.eql(kinds);

            const enums = res.types.find(type => type.kind === 'ENUM') as t.ITypeEnum;
            expect(enums.values).to.eql(enumValues);
          }
        };
        test(`'one' | string `, ['VALUE', 'ENUM'], ['one']);
        test(`'one' | string |"two"`, ['VALUE', 'ENUM'], ['one', 'two']);
        test(`'one' | string | ns:foo | "two"`, ['VALUE', 'REF', 'ENUM'], ['one', 'two']);
      });
    });

    it('UNION', () => {
      const res = TypeValue.parse(`string | number[]   |    "red" | 'blue'`);
      expect(res).to.eql({
        kind: 'UNION',
        typename: `string | number[] | 'red' | 'blue'`,
        types: [
          { kind: 'VALUE', typename: 'string' },
          { kind: 'VALUE', typename: 'number[]' },
          { kind: 'ENUM', typename: `'red' | 'blue'`, values: ['red', 'blue'] },
        ],
      });
    });

    describe('nested groups: eg (string | (boolean | number[]))', () => {
      it('nested - group last', () => {
        const res = TypeValue.parse(`string | (boolean | ('red'|number[]|'blue'))`);

        console.log('-------------------------------------------');
        console.log('res', res);
      });

      it.skip('nested - variants', () => {
        const res = TypeValue.parse(`(string | number) | boolean`);

        console.log('-------------------------------------------');
        console.log('res', res);
      });
    });
  });

  describe('tokenize', () => {
    it('token.next', () => {
      const test = (
        input: string,
        kind: 'VALUE' | 'GROUP' | 'GROUP[]',
        text: string,
        next: string,
      ) => {
        const res = TypeValue.token.next(input);
        expect(res.input).to.eql(input);
        expect(res.kind).to.eql(kind);
        expect(res.text).to.eql(text);
        expect(res.next).to.eql(next);
      };

      // Non-group (VALUE).
      test(`string`, 'VALUE', `string`, ``);
      test(`  string  `, 'VALUE', `string`, ``);
      test(` |string  |   `, `VALUE`, `string`, ``);
      test(`string[]`, 'VALUE', `string[]`, ``);
      test(`number[]`, 'VALUE', `number[]`, ``);
      test(`string[][]`, 'VALUE', `string[][]`, ``);
      test(`  boolean[] `, 'VALUE', `boolean[]`, ``);
      test(`string | boolean | number|`, 'VALUE', `string`, `boolean | number`);
      test(`string | "red" | 'blue'`, 'VALUE', `string`, `"red" | 'blue'`);
      test(`boolean   |   (string | number)`, `VALUE`, `boolean`, `(string | number)`);

      test(`"red"`, `VALUE`, `"red"`, ``);
      test(`  'red'  `, `VALUE`, `'red'`, ``);
      test(`'red' | "green" |`, `VALUE`, `'red'`, `"green"`);

      // Group.
      test(`()`, `GROUP`, ``, ``);
      test(`(string)`, `GROUP`, `string`, ``);
      test(`(string[])`, `GROUP`, `string[]`, ``);
      test(`(string)[]`, `GROUP[]`, `string`, ``);
      test(`(string[])[]`, `GROUP[]`, `string[]`, ``);

      test(` (string | boolean[]) | number| `, `GROUP`, `string | boolean[]`, `number`);
      test(` (string | boolean)[] | number| `, `GROUP[]`, `string | boolean`, `number`);

      test(`(string | (boolean | (number)))`, `GROUP`, `string | (boolean | (number))`, ``);
    });
  });
});
