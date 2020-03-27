import { expect, expectError, t } from '../test';
import { TypeDefault } from '.';

describe.only('TypeDefault', () => {
  describe('toTypeDefault', () => {
    it('from ITypeDef', () => {
      const def: t.ITypeDef = {
        prop: 'name',
        type: { kind: 'VALUE', typename: 'string' },
      };

      const res1 = TypeDefault.toTypeDefault({ ...def });
      expect(res1).to.eql(undefined);

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

    it('throws', () => {
      expect(() => TypeDefault.toTypeDefault(undefined as any)).to.throw();
      expect(() => TypeDefault.toTypeDefault(null as any)).to.throw();
      expect(() => TypeDefault.toTypeDefault({} as any)).to.throw();
    });
  });

  describe('toValue', () => {
    it('throw: REF given without HTTP client', async () => {
      const def: t.ITypeDefaultRef = { ref: 'cell:foo:A1' };
      await expectError(() => TypeDefault.toValue({ def }), 'HTTP client was not provided');
    });

    it('argument variants: ITypeDef | ITypeDefault', async () => {
      const def: t.ITypeDef = {
        prop: 'name',
        type: { kind: 'VALUE', typename: 'string' },
        default: 'hello',
      };

      const res1 = await TypeDefault.toValue({ def });
      expect(res1).to.eql('hello');

      const res2 = await TypeDefault.toValue({ def: { ...def, default: { value: 'foo' } } });
      expect(res2).to.eql('foo');

      const res3 = await TypeDefault.toValue({ def: { value: 123 } });
      expect(res3).to.eql(123);
    });

    it('value: primitives', async () => {
      expect(await TypeDefault.toValue({ def: { value: 'hello' } })).to.eql('hello');
      expect(await TypeDefault.toValue({ def: { value: 123 } })).to.eql(123);
      expect(await TypeDefault.toValue({ def: { value: null } })).to.eql(null);
      expect(await TypeDefault.toValue({ def: { value: undefined } })).to.eql(undefined);
      expect(await TypeDefault.toValue({ def: { value: true } })).to.eql(true);
      expect(await TypeDefault.toValue({ def: { value: false } })).to.eql(false);
    });
  });
});
