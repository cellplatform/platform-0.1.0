import { expect, expectError, t, testFetch, TYPE_DEFS } from '../../test';
import { TypeDefault } from '.';

describe('TypeDefault', () => {
  describe('kind', () => {
    it('UNKNOWN', () => {
      const test = (input: any) => {
        expect(TypeDefault.kind(input)).to.eql({ type: 'UNKNOWN' });
      };
      test(null);
      test(123);
      test([123]);
      test('ns:foo');
      test({});
      test([{}]);
    });

    it('VALUE', () => {
      const test = (value: any) => {
        const single = { value };
        const plural = { value: [value, value] };
        expect(TypeDefault.kind(single)).to.eql({ type: 'VALUE', isArray: false }, value);
        expect(TypeDefault.kind(plural)).to.eql({ type: 'VALUE', isArray: true }, value);
      };

      test(123);
      test('hello');
      test(null);
      test(undefined);
      test(true);
      test(false);
      test({});
      test({ foo: 123 });
    });

    it('REF', () => {
      const REF = { type: 'REF' };
      expect(TypeDefault.kind({ ref: 'ns:foo' })).to.eql(REF);
    });
  });

  describe('toTypeDefault', () => {
    it('from ITypeDef', () => {
      const def: t.ITypeDef = {
        prop: 'name',
        type: { kind: 'VALUE', typename: 'string' },
      };

      const res1 = TypeDefault.toTypeDefault({ ...def });
      expect(res1).to.eql({ value: undefined });

      const res2 = TypeDefault.toTypeDefault({ ...def, default: 'hello' });
      expect(res2).to.eql({ value: 'hello' });

      const res3 = TypeDefault.toTypeDefault({ ...def, default: { value: 'hello' } });
      expect(res3).to.eql({ value: 'hello' });
    });

    it('from ITypeDefault', () => {
      const value: t.ITypeDefaultValue = { value: 'hello' };
      const ref: t.ITypeDefaultRef = { ref: 'ns:foo' };
      expect(TypeDefault.toTypeDefault(value)).to.eql(value);
      expect(TypeDefault.toTypeDefault(ref)).to.eql(ref);
    });

    it('from primitive', () => {
      const test = (value: t.TypeDefaultValue) => {
        const res = TypeDefault.toTypeDefault(value) as t.ITypeDefaultValue;
        expect(res.value).to.eql(value);
      };
      test(undefined);
      test(null);
      test('hello');
      test(123);
      test(true);
      test([123, true, 'three']);
    });
  });

  describe('toValue', () => {
    it('argument variants: ITypeDef | ITypeDefault', async () => {
      const def: t.ITypeDef = {
        prop: 'name',
        type: { kind: 'VALUE', typename: 'string' },
        default: 'hello',
      };

      const res1 = await TypeDefault.toValue({ def });
      expect(res1.kind).to.eql('VALUE');
      expect(res1.value).to.eql('hello');

      const res2 = await TypeDefault.toValue({ def: { ...def, default: { value: 'foo' } } });
      expect(res2.kind).to.eql('VALUE');
      expect(res2.value).to.eql('foo');

      const res3 = await TypeDefault.toValue({ def: { value: 123 } });
      expect(res3.kind).to.eql('VALUE');
      expect(res3.value).to.eql(123);
    });

    describe('toValue (simple: primitive | object)', () => {
      const test = async (value: any) => {
        const res = await TypeDefault.toValue({ def: { value } });
        expect(res.kind).to.eql('VALUE');
        expect(res.value).to.eql(value);
      };

      it('string', async () => {
        await test('hello');
        await test(['one', 'two']);
      });

      it('number', async () => {
        await test(123);
        await test([1, 2, 3]);
      });

      it('boolean', async () => {
        await test(true);
        await test(false);
        await test([true, false]);
      });

      it('null', async () => {
        await test(null);
        await test([null]);
      });

      it('undefined', async () => {
        await test(undefined);
        await test([undefined]);
      });

      it('{}', async () => {
        await test({ foo: 123 });
        await test([{ foo: 123 }, { foo: 456 }]);
      });
    });

    describe('toValue (ref)', () => {
      it('reference not found (undefined)', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const def = { ref: 'cell:foo.sample:A50' };
        const res = await TypeDefault.toValue({ def, fetch });
      });

      it('toValue (cell => primitive | {})', async () => {
        const test = async (
          cell: t.ICellData<any>,
          path: string | undefined,
          expected?: t.ITypeDefaultValue['value'],
        ) => {
          const fetch = testFetch({
            defs: TYPE_DEFS,
            cells: { Z9: cell },
          });
          const def = { ref: 'cell:foo.sample:Z9', path };
          const res = await TypeDefault.toValue({ def, fetch });
          expect(res.value).to.eql(expected, path);
        };

        await test({ value: 'hello' }, undefined, 'hello');
        await test({ value: 'hello' }, 'value', 'hello');
        await test({ value: 'hello' }, 'props:value', undefined);

        await test({ value: 'hello', props: { value: 123 } }, undefined, 123);
        await test({ value: 'hello', props: { value: 123 } }, 'props:value', 123);
        await test({ value: 'hello', props: { value: 123 } }, 'value', 'hello');

        await test({ value: 'hello', props: { value: null } }, undefined, null);
        await test({ value: 'hello', props: { value: undefined } }, undefined, 'hello');
        await test({ value: 'hello', props: { foo: { msg: 1 } } }, 'props:foo', { msg: 1 });
        await test({ props: { 'foo.bar': { msg: 2 } } }, 'props:foo.bar', { msg: 2 });
      });

      describe('errors', () => {
        it('throw: REF given without an HTTP fetch client', async () => {
          const def: t.ITypeDefaultRef = { ref: 'cell:foo:A1' };
          await expectError(
            () => TypeDefault.toValue({ def }),
            'HTTP fetch client was not provided',
          );
        });

        it('throw: only "cell" and "ns" URIs supported', async () => {
          const fetch = testFetch({ defs: TYPE_DEFS });
          const test = async (ref: string) => {
            const def: t.ITypeDefaultRef = { ref };
            await expectError(
              () => TypeDefault.toValue({ def, fetch }),
              `URI must point to a cell`,
            );
          };
          await test('file:foo:abc');
          await test('cell:foo:A');
          await test('cell:foo:1');
          await test('ns:foo');
        });
      });
    });
  });
});
